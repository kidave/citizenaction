// pages/api/ward/[wardId]/project/admin.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // REMOVE .eq("user_id", user.id) - RLS will handle security
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .eq("ward_code", wardId)
      .order("created_at", { ascending: false }); // Add ordering

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}