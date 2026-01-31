// src/pages/api/community/[slug]/upload.js
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createServerSupabase(token);
  const { slug } = req.query;
  const { url, type } = req.body; // Just receive the URL from frontend

  // Verify user owns community
  const { data: { user } } = await supabase.auth.getUser();
  const { data: community } = await supabase
    .from("community")
    .select("owner_user_id")
    .eq("slug", slug)
    .single();

  if (!community || community.owner_user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Update community record
  const { error } = await supabase
    .from("community")
    .update({ [`${type}_url`]: url })
    .eq("slug", slug);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
}