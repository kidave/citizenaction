import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Not authenticated - no token" });
    }

    const supabase = createServerSupabase(token);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token or user not found" });
    }

    const { data, error } = await supabase.rpc("check_committee_status", {
      user_id: user.id,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Always return an object, not an array
    return res.status(200).json(data?.[0] || { is_member: false, has_application: false });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
