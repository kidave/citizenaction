// pages/api/ward/[wardId]/project/public.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId } = req.query;
  const supabase = createServerSupabase();

  if (req.method === "GET") {
    const { data: projects, error } = await supabase
      .from("project")
      .select("*")
      .eq("ward_code", wardId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.json(projects || []);
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}