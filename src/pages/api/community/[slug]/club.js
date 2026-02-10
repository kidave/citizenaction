// pages/api/community/[slug]/club.js
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: "Missing community slug" });
  }

  const supabase = createServerSupabase();

  try {
    // Get community ID
    const { data: community, error: communityError } = await supabase
      .from("community")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (communityError || !community) {
      return res.status(404).json({ 
        error: "Community not found",
        details: `Community with slug '${slug}' not found or inactive`
      });
    }

    // Get club - CORRECTED ORDER SYNTAX
    const { data: club, error } = await supabase
      .from("community_committee_public")
      .select("*")
      .eq("community_id", community.id)
      .order("is_default", { ascending: false })  // Correct syntax
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ 
        error: "Failed to fetch club", 
        details: error.message
      });
    }

    // Return club
    return res.status(200).json(club || []);
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
}