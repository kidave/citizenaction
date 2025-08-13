import { supabase } from "utils/supabaseClient";

export default async function handler(req, res) {
  const { wardId } = req.query;

  if (!wardId) {
    return res.status(400).json({ error: "Ward code is required" });
  }

  try {
    // Fetch committee members with role_id 1 (Convenor) or 2 (Co-Convenor) for this ward
    const { data, error } = await supabase
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

    if (error) throw error;

    // Find convenor and co-convenor
    const convenor = data.find((m) => m.role_id === 1);
    const coConvenor = data.find((m) => m.role_id === 2);

    res.status(200).json({
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
    res.status(500).json({ error: "Failed to fetch leadership" });
  }
}
