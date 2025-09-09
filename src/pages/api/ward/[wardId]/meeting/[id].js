// pages/api/ward/[wardId]/meeting/[id].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId, id } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "PUT") {
    try {
      // Check if user owns this meeting
      const { data: existingMeeting, error: checkError } = await supabase
        .from("meeting")
        .select("user_id")
        .eq("id", id)
        .eq("ward_code", wardId)
        .single();

      if (checkError || existingMeeting.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this meeting" });
      }

      // Update the meeting
      const { data, error } = await supabase
        .from("meeting")
        .update(req.body)
        .eq("id", id)
        .eq("ward_code", wardId)
        .select(`
          *,
          meeting_images (*)
        `)  // Include related images in the response
        .single();
        
      if (error) {
        console.error("Error updating meeting:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.json(data);
    } catch (error) {
      console.error("Unexpected error in PUT handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Check if user owns this meeting
      const { data: existingMeeting, error: checkError } = await supabase
        .from("meeting")
        .select("user_id")
        .eq("id", id)
        .eq("ward_code", wardId)
        .single();

      if (checkError || existingMeeting.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to delete this meeting" });
      }

      // First, get all images for this meeting to delete from storage later
      const { data: images, error: imagesError } = await supabase
        .from("meeting_images")
        .select("path")
        .eq("meeting_id", id);
        
      if (imagesError) {
        console.error("Error fetching meeting images:", imagesError);
      }

      // Delete the meeting (this should cascade delete meeting_images if foreign key is set up correctly)
      const { error } = await supabase
        .from("meeting")
        .delete()
        .eq("id", id)
        .eq("ward_code", wardId);
        
      if (error) {
        console.error("Error deleting meeting:", error);
        return res.status(400).json({ error: error.message });
      }
      
      // TODO: Add code here to delete actual image files from storage bucket
      // if (images && images.length > 0) {
      //   for (const image of images) {
      //     await deleteImageFromStorage(image.path);
      //   }
      // }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Unexpected error in DELETE handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}