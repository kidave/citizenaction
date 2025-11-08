// pages/api/ward/[wardCode]/ward_project/[id].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id } = req.query;
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
      // Strip out non-table fields (prevent 'files' column errors)
      const {
        files,
        ward_name,
        road_name,
        junction_name,
        project_files,
        ...cleanBody
      } = req.body || {};

      // Add safeguard: force correct ward_code and skip user_id overwrite
      delete cleanBody.user_id;
      cleanBody.ward_code = wardCode;

      const { data, error } = await supabase
        .from("ward_project")
        .update(cleanBody)
        .eq("id", id)
        .eq("ward_code", wardCode)
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
      // Fetch associated file paths
      const { data: files, error: filesError } = await supabase
        .from("ward_project_file")
        .select("path")
        .eq("project_id", id);

      if (!filesError && files?.length > 0) {
        const paths = files.map((file) => file.path);
        const { error: storageError } = await supabase.storage
          .from("ward")
          .remove(paths);
        if (storageError)
          console.error("Error deleting files from storage:", storageError);
      }

      // Delete the project itself
      const { error } = await supabase
        .from("ward_project")
        .delete()
        .eq("id", id)
        .eq("ward_code", wardCode);

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
