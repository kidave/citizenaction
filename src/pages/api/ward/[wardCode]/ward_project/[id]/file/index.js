// pages/api/ward/[wardCode]/ward_project/[id]/file/index.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id: projectId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const { data: files, error } = await supabase
      .from("ward_project_file")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    return res.json(files);
  }

  if (req.method === "POST") {
    return res.status(501).json({ error: "File upload not implemented. Use Supabase client directly instead." });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}