// pages/api/club/[community]/[scopeType]/[scopeCode].js
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  const { method } = req;
  const { community, scopeType, scopeCode } = req.query;
  
  if (!community || !scopeType || !scopeCode) {
    return res.status(400).json({ error: "Community, scope type, and scope code are required" });
  }

  if (method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabase();

  try {
    // Fetch club data from a public view
    const { data: club, error } = await supabase
      .from("community_committee_public")
      .select("*")
      .eq("community_slug", community)
      .eq("scope_type", scopeType)
      .eq("scope_code", scopeCode)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(404).json({ error: "Club not found" });
    }

    return res.status(200).json(club);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}