import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function allowedSource(url: URL) {
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  return (
    host === "instagram.com" ||
    host === "www.instagram.com" ||
    host.endsWith(".instagram.com") ||
    host === "cdninstagram.com" ||
    host.endsWith(".cdninstagram.com") ||
    host === "fbcdn.net" ||
    host.endsWith(".fbcdn.net")
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Authorization required" }, 401);

  const token = auth.replace(/^Bearer\s+/i, "");
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  const userId = authData.user?.id;
  if (authError || !userId) return json({ error: "Invalid authentication" }, 401);

  const { data: adminCheck, error: adminError } = await adminClient
    .from("profile")
    .select("user_id")
    .eq("role", "admin")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError) return json({ error: adminError.message }, 500);
  if (!adminCheck) return json({ error: "Administrator access required" }, 403);

  let payload: { personId?: string; sourceUrl?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const personId = String(payload.personId || "").trim();
  const sourceUrl = String(payload.sourceUrl || "").trim();

  if (!personId || !sourceUrl) {
    return json({ error: "personId and sourceUrl are required" }, 400);
  }

  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    return json({ error: "Invalid image URL" }, 400);
  }

  if (!allowedSource(parsed)) {
    return json({ error: "Only Instagram and Meta CDN image URLs are supported" }, 400);
  }

  const { data: person, error: personError } = await adminClient
    .from("person")
    .select("id")
    .eq("id", personId)
    .maybeSingle();

  if (personError) return json({ error: personError.message }, 500);
  if (!person) return json({ error: "Person not found" }, 404);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(sourceUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": "CitizenAction/1.0",
      },
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unable to fetch image" },
      502,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return json({ error: `Remote image returned HTTP ${response.status}` }, 502);
  }

  const contentType = (response.headers.get("content-type") || "")
    .split(";")[0]
    .toLowerCase();
  const extension = ALLOWED_TYPES.get(contentType);
  if (!extension) {
    return json({ error: "Remote URL did not return a supported image type" }, 415);
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) {
    return json({ error: "Image must be 5 MB or smaller" }, 413);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0) return json({ error: "Remote image was empty" }, 502);
  if (bytes.byteLength > MAX_BYTES) {
    return json({ error: "Image must be 5 MB or smaller" }, 413);
  }

  const storagePath = `governance/person/${personId}/image.${extension}`;

  const { error: uploadError } = await adminClient.storage
    .from("governance")
    .upload(storagePath, bytes, {
      contentType,
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) return json({ error: uploadError.message }, 500);

  const { data: publicUrlData } = adminClient.storage
    .from("governance")
    .getPublicUrl(storagePath);

  const imageUrl = publicUrlData?.publicUrl;
  if (!imageUrl) return json({ error: "Image uploaded but public URL was unavailable" }, 500);

  return json({
    imageUrl: `${imageUrl}?v=${Date.now()}`,
    storagePath,
    contentType,
  });
});
