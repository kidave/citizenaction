// pages/api/ward/[wardId]/update/[id].js
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
      // Check if user owns this update
      const { data: existingUpdate, error: checkError } = await supabase
        .from("monthly_update")
        .select("user_id")
        .eq("id", id)
        .eq("ward_code", wardId)
        .single();

      if (checkError || existingUpdate.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this update" });
      }

      const { data, error } = await supabase
        .from("monthly_update")
        .update(req.body)
        .eq("id", id)
        .eq("ward_code", wardId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating update:", error);
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
      // Check if user owns this update
      const { data: existingUpdate, error: checkError } = await supabase
        .from("monthly_update")
        .select("user_id")
        .eq("id", id)
        .eq("ward_code", wardId)
        .single();

      if (checkError || existingUpdate.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to delete this update" });
      }

      // First, get all images for this update to delete from storage
      const { data: images, error: imagesError } = await supabase
        .from("update_images")
        .select("path")
        .eq("update_id", id);
        
      if (imagesError) {
        console.error("Error fetching update images:", imagesError);
      }

      // Delete images from storage
      if (images && images.length > 0) {
        const imagePaths = images.map(img => img.path);
        const { error: storageError } = await supabase.storage
          .from("ward")
          .remove(imagePaths);
          
        if (storageError) {
          console.error("Error deleting images from storage:", storageError);
        }
      }

      // Delete the update (this should cascade delete update_images)
      const { error } = await supabase
        .from("monthly_update")
        .delete()
        .eq("id", id)
        .eq("ward_code", wardId);
        
      if (error) {
        console.error("Error deleting update:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Unexpected error in DELETE handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}