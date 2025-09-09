// pages/api/ward/[wardId]/meeting/public.js
import { supabase } from "utils/supabaseClient";

export default async function handler(req, res) {
  const { wardId } = req.query;
  if (!wardId) return res.status(400).json({ error: "Ward code is required" });

  try {
    const { data, error } = await supabase
      .from("monthly_update")
      .select("*")
      .eq("ward_code", wardId)
      .order("date", { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
}