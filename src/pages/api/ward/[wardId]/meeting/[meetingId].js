// pages/api/ward/[wardId]/meeting/[meetingId].js
import { createServerSupabase } from "utils/supabaseServer";
import { isWardManager } from "utils/rbac";

/**
 * GET    /api/ward/[wardId]/meeting/[meetingId] → fetch single meeting
 * PUT    /api/ward/[wardId]/meeting/[meetingId] → update meeting
 * DELETE /api/ward/[wardId]/meeting/[meetingId] → delete meeting
 */
export default async function handler(req, res) {
  const { wardId, meetingId } = req.query;
  const supabase = createServerSupabase(req, res);

  // helper: fetch meeting with ownership
  const getMeeting = async () => {
    const { data, error } = await supabase
      .from("meeting")
      .select("*")
      .eq("id", meetingId)
      .eq("ward_code", wardId)
      .single();

    return error ? null : data;
  };

  if (req.method === "GET") {
    try {
      const m = await getMeeting();
      if (!m) return res.status(404).json({ error: "Meeting not found" });
      return res.status(200).json(m);
    } catch {
      return res.status(500).json({ error: "Failed to fetch meeting" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const m = await getMeeting();
      if (!m) return res.status(404).json({ error: "Meeting not found" });

      const canManage = await isWardManager(supabase, wardId);
      const isOwner = m.user_id === user.id;
      if (!canManage && !isOwner)
        return res.status(403).json({ error: "Forbidden" });

      const { data, error } = await supabase
        .from("meeting")
        .update(req.body)
        .eq("id", meetingId)
        .eq("ward_code", wardId)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to update meeting" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const m = await getMeeting();
      if (!m) return res.status(404).json({ error: "Meeting not found" });

      const canManage = await isWardManager(supabase, wardId);
      const isOwner = m.user_id === user.id;
      if (!canManage && !isOwner)
        return res.status(403).json({ error: "Forbidden" });

      const { error } = await supabase
        .from("meeting")
        .delete()
        .eq("id", meetingId)
        .eq("ward_code", wardId);

      if (error) throw error;
      return res.status(204).end();
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to delete meeting" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res
    .status(405)
    .json({ error: `Method ${req.method} Not Allowed` });
}
