// pages/api/ward/[wardId]/project/[id].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId, id } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // --- Auth check ---
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // --- UPDATE project ---
  if (req.method === "PUT") {
    try {
      // Strip out non-table fields (prevent 'images' column errors)
      const {
        images,
        ward_name,
        road_name,
        junction_name,
        project_images,
        ...cleanBody
      } = req.body || {};

      // Add safeguard: force correct ward_code and skip user_id overwrite
      delete cleanBody.user_id;
      cleanBody.ward_code = wardId;

      const { data, error } = await supabase
        .from("project")
        .update(cleanBody)
        .eq("id", id)
        .eq("ward_code", wardId)
        .select("*")
        .single();

      if (error) throw error;

      return res.json(data);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  // --- DELETE project (with its images) ---
  if (req.method === "DELETE") {
    try {
      // Fetch associated image paths
      const { data: images, error: imagesError } = await supabase
        .from("project_images")
        .select("path")
        .eq("project_id", id);

      if (!imagesError && images?.length > 0) {
        const paths = images.map((img) => img.path);
        const { error: storageError } = await supabase.storage
          .from("ward")
          .remove(paths);
        if (storageError)
          console.error("Error deleting images from storage:", storageError);
      }

      // Delete the project itself
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

  // --- Unsupported methods ---
  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
