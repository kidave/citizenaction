// pages/api/ward/[wardCode]/announcement/[id].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("ward_announcement_with_files")
        .select("*")
        .eq("id", id)
        .eq("ward_code", wardCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: "Announcement not found" });
        }
        console.error("Error fetching announcement:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.json(data);
    } catch (error) {
      console.error("Unexpected error in GET handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      // Check if user owns this announcement
      const { data: existingAnnouncement, error: checkError } = await supabase
        .from("ward_announcement")
        .select("user_id")
        .eq("id", id)
        .eq("ward_code", wardCode)
        .single();

      if (checkError) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      if (existingAnnouncement.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this announcement" });
      }

      // Update the announcement
      const { data, error } = await supabase
        .from("ward_announcement")
        .update(req.body)
        .eq("id", id)
        .eq("ward_code", wardCode)
        .select(`
          *,
          ward_announcement_file (*)
        `)  // Include related files in response (consistent with meetings)
        .single();
        
      if (error) {
        console.error("Error updating announcement:", error);
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
      // Check if user owns this announcement
      const { data: existingAnnouncement, error: checkError } = await supabase
        .from("ward_announcement")
        .select("user_id")
        .eq("id", id)
        .eq("ward_code", wardCode)
        .single();

      if (checkError) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      // ONLY allow the announcement owner to delete
      if (existingAnnouncement.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to delete this announcement. Only the announcement owner can delete it." });
      }

      // First, get all files for this announcement to delete from storage
      const { data: files, error: filesError } = await supabase
        .from("ward_announcement_file")
        .select("path")
        .eq("announcement_id", id);
        
      if (filesError) {
        console.error("Error fetching announcement files:", filesError);
      }

      // Delete files from storage
      if (files && files.length > 0) {
        const filePaths = files.map(file => file.path);
        const { error: storageError } = await supabase.storage
          .from("ward")
          .remove(filePaths);
          
        if (storageError) {
          console.error("Error deleting files from storage:", storageError);
        }
      }

      // Delete the announcement (this should cascade delete ward_announcement_file)
      const { error } = await supabase
        .from("ward_announcement")
        .delete()
        .eq("id", id)
        .eq("ward_code", wardCode);
        
      if (error) {
        console.error("Error deleting announcement:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Unexpected error in DELETE handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}