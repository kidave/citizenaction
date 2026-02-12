// pages/api/community/[slug]/upload.js

import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { slug } = req.query;
  const { url, type } = req.body;

  const allowedTypes = ["logo", "cover"];
  if (!allowedTypes.includes(type))
    return res.status(400).json({ error: "Invalid upload type" });

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createServerSupabase(token);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: "Invalid token" });

  const { error } = await supabase
    .from("community")
    .update({ [`${type}_url`]: url })
    .eq("slug", slug);

  if (error) return res.status(403).json({ error: error.message });

  return res.status(200).json({ success: true });
}
