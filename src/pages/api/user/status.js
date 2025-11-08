// pages/api/user/status.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const supabase = createServerSupabase(token);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Single query using the view
    const { data: status, error } = await supabase
      .from("user_committee_status")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    return res.json(status || {
      is_member: false,
      has_application: false,
      application_status: null,
      ward_code: null,
      ward_name: null,
      role_id: null,
      scope_type: null
    });

  } catch (err) {
    console.error("Error checking user status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}