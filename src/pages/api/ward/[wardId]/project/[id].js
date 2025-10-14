// pages/api/ward/[wardId]/project/[id].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId, id } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Just check authentication - RLS handles the rest
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method === "PUT") {
    try {
      const { data, error } = await supabase
        .from("project")
        .update(req.body)
        .eq("id", id)
        .eq("ward_code", wardId)
        .select(`*, project_images (*)`)
        .single();

      if (error) throw error;
      return res.json(data);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Delete images first
      const { data: images, error: imagesError } = await supabase
        .from("project_images")
        .select("path")
        .eq("project_id", id);

      if (!imagesError && images?.length > 0) {
        const imagePaths = images.map((img) => img.path);
        const { error: storageError } = await supabase.storage
          .from("ward")
          .remove(imagePaths);
        if (storageError) console.error("Error deleting images from storage:", storageError);
      }

      // Delete project
      const { error } = await supabase
        .from("project")
        .delete()
        .eq("id", id)
        .eq("ward_code", wardId);

      if (error) throw error;
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}