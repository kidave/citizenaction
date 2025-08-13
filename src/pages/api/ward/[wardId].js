import { supabase } from "utils/supabaseClient";

export default async function handler(req, res) {
  const { wardId } = req.query;
  if (!wardId) return res.status(400).json({ error: "Ward code is required" });

  try {
    // Get ward name
    const { data: wardData, error: wardError } = await supabase
      .from("ward")
      .select("name")
      .eq("code", wardId)
      .single();

    // If error and not "no rows found", throw
    if (wardError && wardError.code !== "PGRST116") throw wardError;

    // If no ward found, return 404
    if (!wardData) {
      return res.status(404).json({
        wardName: "",
        convenor: null,
        coConvenor: null,
      });
    }

    // Get convenor and co-convenor
    const { data: committeeData, error: committeeError } = await supabase
      .from("committee")
      .select(
        `
        user_id,
        role_id,
        profile:profile (
          name,
          email
        )
      `,
      )
      .eq("ward_code", wardId)
      .in("role_id", [1, 2]);
    if (committeeError) throw committeeError;

    const convenor = committeeData.find((m) => m.role_id === 1) || null;
    const coConvenor = committeeData.find((m) => m.role_id === 2) || null;

    res.status(200).json({
      wardName: wardData.name,
      convenor: convenor
        ? {
            name: convenor.profile?.name || "",
            email: convenor.profile?.email || "",
          }
        : null,
      coConvenor: coConvenor
        ? {
            name: coConvenor.profile?.name || "",
            email: coConvenor.profile?.email || "",
          }
        : null,
    });
  } catch (error) {
    console.error("Ward API error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch ward info" });
  }
}
