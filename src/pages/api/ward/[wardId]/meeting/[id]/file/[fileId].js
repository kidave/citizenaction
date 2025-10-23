// pages/api/ward/[wardId]/meeting/[id]/file/[fileId].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId, id: meetingId, fileId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "DELETE") {
    // Validate existence
    const { data: file, error: fetchError } = await supabase
      .from("meeting_images")
      .select("id, path, meeting_id")
      .eq("id", fileId)
      .single();

    if (fetchError || !file) return res.status(404).json({ error: "File not found" });
    if (String(file.meeting_id) !== String(meetingId)) return res.status(400).json({ error: "Mismatched meeting" });

    // Optional: ensure requester is authorized
    const { data: meeting, error: meetingErr } = await supabase
      .from("meeting")
      .select("ward_id, user_id")
      .eq("id", meetingId)
      .single();

    if (meetingErr) {
      console.error("Error fetching meeting for auth:", meetingErr);
      return res.status(400).json({ error: meetingErr.message });
    }

    // Check if user is authorized (owner of the meeting)
    if (meeting.user_id !== user.id) return res.status(403).json({ error: "Not authorized" });

    // Delete from storage (ignore errors)
    if (file.path) {
      const { error: storageError } = await supabase.storage.from("ward").remove([file.path]);
      if (storageError) console.error("Storage remove error:", storageError);
    }

    // Delete DB row
    const { error } = await supabase.from("meeting_images").delete().eq("id", fileId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}