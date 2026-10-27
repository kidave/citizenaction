import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchGovernanceImage } from "../_shared/governance-image.ts";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Authorization required" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const token = auth.replace(/^Bearer\s+/i, "");
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

  let payload: { organizationId?: string; sourceUrl?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const entityId = String(payload.organizationId || "").trim();
  const sourceUrl = String(payload.sourceUrl || "").trim();
  if (!entityId || !sourceUrl) {
    return json({ error: "organizationId and sourceUrl are required" }, 400);
  }

  const { data: entity, error: entityError } = await adminClient
    .from("governance")
    .select("id")
    .eq("id", entityId)
    .maybeSingle();
  if (entityError) return json({ error: entityError.message }, 500);
  if (!entity) return json({ error: "Organization not found" }, 404);

  let image: { bytes: Uint8Array; contentType: string; extension: string };
  try {
    image = await fetchGovernanceImage(sourceUrl);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unable to fetch image." }, 400);
  }

  const { bytes, contentType, extension } = image;
  const storagePath = `governance/organization/${entityId}/logo.${extension}`;
  const { error: uploadError } = await adminClient.storage
    .from("governance")
    .upload(storagePath, bytes, {
      contentType,
      cacheControl: "3600",
      upsert: true,
    });
  if (uploadError) return json({ error: uploadError.message }, 500);

  const { data: publicUrlData } = adminClient.storage.from("governance").getPublicUrl(storagePath);
  const imageUrl = publicUrlData?.publicUrl;
  if (!imageUrl) return json({ error: "Image uploaded but public URL was unavailable" }, 500);

  return json({ imageUrl: `${imageUrl}?v=${Date.now()}`, storagePath, contentType });
});
