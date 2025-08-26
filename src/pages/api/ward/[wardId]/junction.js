import { supabase } from "utils/supabaseClient";

export default async function handler(req, res) {
  const { wardId } = req.query;
  if (!wardId) return res.status(400).json({ error: "Ward code is required" });

  try {
    const { data, error } = await supabase
      .rpc("get_ward_junctions", {
      ward_code: wardId,
    });
    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch junctions" });
  }
}
