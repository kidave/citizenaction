import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  let { slug } = req.query;

  // Normalize slug
  if (Array.isArray(slug)) slug = slug[0];
  if (!slug) {
    return res.status(400).json({ error: "Missing community slug" });
  }

  const supabase = createServerSupabase(null);

  const { data, error } = await supabase
    .from("community_public")
    .select(`
      id,
      name,
      slug,
      description,
      email,
      website,
      contact_number,
      created_at,
      logo_url,
      cover_url,
      primary_color,
      is_active,
      owner_id,
      owner_name,
      avatar_url
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Supabase error:", error);
    return res.status(404).json({ error: "Community not found" });
  }

  return res.status(200).json(data);
}
