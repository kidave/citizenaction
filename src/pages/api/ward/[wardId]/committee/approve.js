import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const supabase = createServerSupabase(token);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: "Invalid token" });

    const { form_id, approve } = req.body;
    if (!form_id || approve === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // set approver for audit
    await supabase.rpc("set_app_current_user", { user_id: user.id });

    const { error } = await supabase
      .from("committee_form")
      .update({
        application_status: approve ? "Approved" : "Rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", form_id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Approval API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
