// pages/api/ward/[wardCode]/announcement/[id]/file/[fileId].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id: announcementId, fileId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "DELETE") {
    try {
      // Validate file existence
      const { data: file, error: fetchError } = await supabase
        .from("ward_announcement_file")
        .select("id, path, announcement_id")
        .eq("id", fileId)
        .single();

      if (fetchError || !file) return res.status(404).json({ error: "File not found" });
      if (String(file.announcement_id) !== String(announcementId)) return res.status(400).json({ error: "Mismatched announcement" });

      // Check if user is authorized (owner of the announcement)
      const { data: announcement, error: announcementErr } = await supabase
        .from("ward_announcement")
        .select("ward_code, user_id")
        .eq("id", announcementId)
        .single();

      if (announcementErr) {
        console.error("Error fetching announcement for auth:", announcementErr);
        return res.status(400).json({ error: announcementErr.message });
      }

      // Check if user is authorized (owner of the announcement)
      if (announcement.user_id !== user.id) return res.status(403).json({ error: "Not authorized" });

      // Delete from storage (ignore errors)
      if (file.path) {
        const { error: storageError } = await supabase.storage.from("ward").remove([file.path]);
        if (storageError) console.error("Storage remove error:", storageError);
      }

      // Delete DB row
      const { error } = await supabase.from("ward_announcement_file").delete().eq("id", fileId);
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ success: true });
    } catch (error) {
      console.error("Unexpected error in DELETE handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}