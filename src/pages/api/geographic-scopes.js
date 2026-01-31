// pages/api/geographic-scopes.js
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  const { type, parentCode } = req.query;
  
  const supabase = createServerSupabase(null);

  try {
    let query = supabase
      .from("geographic_scope")
      .select("id, type, code, name, metadata, parent_id")
      .order("name");

    // Filter by type if provided
    if (type) {
      query = query.eq("type", type);
    }

    // Filter by parent code if provided
    if (parentCode) {
      // First get the parent's ID
      const { data: parent } = await supabase
        .from("geographic_scope")
        .select("id")
        .eq("code", parentCode)
        .single();

      if (parent) {
        query = query.eq("parent_id", parent.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching geographic scopes:", error);
      return res.status(500).json({ error: "Failed to fetch geographic scopes" });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}