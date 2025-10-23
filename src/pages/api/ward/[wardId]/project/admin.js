// pages/api/ward/[wardId]/project/admin.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const { data: projects, error } = await supabase
      .from("project")
      .select("*")
      .eq("ward_code", wardId)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.json(projects || []);
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}