// pages/api/committee/review.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const supabase = createServerSupabase(token);

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { form_id, action } = req.body; // 'Approved' | 'Rejected'
    if (!form_id || !action) {
      return res.status(400).json({ error: "form_id and action are required" });
    }
    if (!["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({ error: "Action must be Approved or Rejected" });
    }

    // --- Check approver's role (must be convenor/co-convenor) ---
    const { data: approver, error: approverError } = await supabase
      .from("committee")
      .select("ward_code, role_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (approverError) throw approverError;
    if (!approver || ![1, 2].includes(approver.role_id)) {
      return res.status(403).json({ error: "Not authorized to review applications" });
    }

    // --- Validate that application belongs to their ward ---
    const { data: form, error: formError } = await supabase
      .from("committee_form")
      .select("ward_code")
      .eq("id", form_id)
      .maybeSingle();

    if (formError) throw formError;
    if (!form) return res.status(404).json({ error: "Application not found" });
    if (form.ward_code !== approver.ward_code) {
      return res.status(403).json({ error: "You can only review applications in your ward" });
    }

    // --- Call SQL function (handles audit + committee insert/update) ---
    const { error: rpcError } = await supabase.rpc("review_committee_application", {
      p_form_id: form_id,
      p_action: action,
      p_approved_by: user.id,
      p_ward_code: approver.ward_code,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return res.status(400).json({ error: rpcError.message });
    }

    return res.status(200).json({ success: true, message: `Application ${action}` });
  } catch (err) {
    console.error("Review API Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
