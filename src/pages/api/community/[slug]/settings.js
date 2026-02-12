// pages/api/community/[slug]/settings.js

import { createServerSupabase } from "@/lib/supabase/server";
import { communityUpdateSchema } from "@/schemas/community";

export default async function handler(req, res) {
  const slug = Array.isArray(req.query.slug)
    ? req.query.slug[0]
    : req.query.slug;

  if (!slug) return res.status(400).json({ error: "Slug required" });

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  // 🔥 IMPORTANT: use user token client (NOT service role)
  const supabase = createServerSupabase(token);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: "Invalid token" });

  if (req.method === "PUT") {
    try {
      const validated = communityUpdateSchema.parse(req.body);

      const { error } = await supabase
        .from("community")
        .update(validated)
        .eq("slug", slug);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
