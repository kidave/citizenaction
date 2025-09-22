// pages/api/ward/[wardId]/project/[id]/images/index.js
import { createServerSupabase } from "utils/supabaseServer";
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const { wardId, id: projectId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "POST") {
    return res.status(501).json({ error: "File upload not implemented. Use Supabase client directly instead." });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}