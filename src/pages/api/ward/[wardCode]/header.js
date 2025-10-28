// pages/api/ward/[wardCode]/header.js
import { supabase } from "utils/supabaseClient";

export default async function handler(req, res) {
  const { wardCode } = req.query;
  if (!wardCode) return res.status(400).json({ error: "Ward code is required" });

  try {
    // Get ward name
    const { data: wardData, error: wardError } = await supabase
      .from("ward")
      .select("name")
      .eq("code", wardCode)
      .single();

    if (wardError) throw wardError;
    if (!wardData) {
      return res.status(404).json({
        wardName: "",
        convenor: null,
        coConvenor: null,
      });
    }

    // Get convenor and co-convenor from committee_member_view
    const { data: committeeData, error: committeeError } = await supabase
      .from("committee_member_view")
      .select("user_id, role_id, name, email, avatar_url, designation, social")
      .eq("ward_code", wardCode)
      .in("role_id", [1, 2]);

    if (committeeError) throw committeeError;

    const convenor = committeeData.find((m) => m.role_id === 1) || null;
    const coConvenor = committeeData.find((m) => m.role_id === 2) || null;

    res.status(200).json({
      wardName: wardData.name,
      convenor,
      coConvenor,
    });
  } catch (error) {
    console.error("Ward header API error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch ward header" });
  }
}