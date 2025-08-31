// pages/api/ward/[wardId]/committee/pending.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId } = req.query;

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const supabase = createServerSupabase(token);

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: "Invalid user" });

    // Use your SQL function
    const { data, error } = await supabase.rpc("get_pending_applications", {
      p_user_id: user.id,
      p_ward_code: wardId,
    });

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (err) {
    console.error("Pending API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
