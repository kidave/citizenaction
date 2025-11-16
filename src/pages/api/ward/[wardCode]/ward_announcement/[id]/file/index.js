// pages/api/ward/[wardCode]/announcement/[id]/file/index.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id: announcementId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    try {
      const { data: files, error } = await supabase
        .from("ward_announcement_file")
        .select("*")
        .eq("announcement_id", announcementId)
        .order("created_at", { ascending: true });
      
      if (error) return res.status(400).json({ error: error.message });
      return res.json(files);
    } catch (error) {
      console.error("Unexpected error in GET handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      // Check if user owns this announcement
      const { data: announcement, error: announcementError } = await supabase
        .from("ward_announcement")
        .select("user_id")
        .eq("id", announcementId)
        .single();

      if (announcementError || announcement.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to add files to this announcement" });
      }

      // Handle file upload
      const { path, type = 'image', caption, is_main = false } = req.body;

      const { data: file, error } = await supabase
        .from("ward_announcement_file")
        .insert({
          announcement_id: announcementId,
          path,
          type,
          caption,
          is_main
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(file);
    } catch (error) {
      console.error("Unexpected error in POST handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}