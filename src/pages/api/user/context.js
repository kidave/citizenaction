// pages/api/user/context.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
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

    // Fetch ALL committee memberships for this user
    const { data: committees, error: committeeError } = await supabase
      .from("committee")
      .select("ward_code, role_id")
      .eq("user_id", user.id);

    if (committeeError) throw committeeError;

    res.json({
      user_id: user.id,
      committees: committees || [],
      // convenience flags
      hasAnyMembership: committees?.length > 0,
      reviewerWardCodes: (committees || [])
        .filter((c) => [1, 2].includes(c.role_id))
        .map((c) => c.ward_code),
    });
  } catch (err) {
    console.error("User context API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
