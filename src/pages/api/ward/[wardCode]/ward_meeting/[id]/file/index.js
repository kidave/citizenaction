// pages/api/ward/[wardCode]/ward_meeting/[id]/file/index.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id: meetingId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const { data: files, error } = await supabase
      .from("ward_meeting_file")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("created_at", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    return res.json(files);
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}