// pages/api/community/search.js
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  const supabase = createServerSupabase(null);

  const { data, error } = await supabase
    .from("community_public")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to fetch communities" });
  }

  return res.status(200).json(data || []);
}