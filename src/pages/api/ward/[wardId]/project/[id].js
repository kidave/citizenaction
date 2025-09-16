// pages/api/ward/[wardId]/project/[id].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId, id } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // 1. Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // 2. Check if user has a ward role (convenor, co-convenor, member)
  const { data: roleRow, error: roleError } = await supabase
    .from("committee")
    .select("role_id")
    .eq("ward_code", wardId)
    .eq("user_id", user.id)
    .single();

  const hasWardRole = roleRow && [1, 2, 3].includes(roleRow.role_id);
  // 👆 adapt role_id values to match your DB:
  // e.g. 1 = convenor, 2 = co-convenor, 3 = member, etc.

  if (!hasWardRole) {
    return res.status(403).json({ error: "You are not a member of this ward committee" });
  }

  if (req.method === "PUT") {
    try {
      const { data, error } = await supabase
        .from("project")
        .update(req.body)
        .eq("id", id)
        .eq("ward_code", wardId)
        .select(`
          *,
          project_images (*)
        `)
        .single();

      if (error) {
        console.error("Error updating project:", error);
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

      if (error) {
        console.error("Error deleting project:", error);
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
