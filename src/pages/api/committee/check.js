import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const supabase = createServerSupabase(token);

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check if user is already a committee member and include ward name
    const { data: committeeData, error: committeeError } = await supabase
      .from("committee")
      .select(`
        ward_code,
        role_id,
        ward:ward_code ( name )
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (committeeError) {
      throw committeeError;
    }

    // Check if user has any applications
    const { data: applicationData, error: applicationError } = await supabase
      .from("committee_form")
      .select("application_status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (applicationError) {
      throw applicationError;
    }

    return res.json({
      is_member: !!committeeData,
      has_application: !!applicationData,
      application_status: applicationData?.application_status || null,
      ward_code: committeeData?.ward_code || null,
      ward_name: committeeData?.ward?.name || null, // 👈 added ward_name
      role_id: committeeData?.role_id || null,
    });
  } catch (err) {
    console.error("Error checking status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
