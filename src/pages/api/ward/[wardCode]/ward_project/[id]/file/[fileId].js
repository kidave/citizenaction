// pages/api/ward/[wardCode]/ward_project/[id]/file/[fileId].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id: projectId, fileId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "DELETE") {
    // Validate existence and ownership
    const { data: file, error: fetchError } = await supabase
      .from("ward_project_file")
      .select("id, path, project_id")
      .eq("id", fileId)
      .single();

    if (fetchError || !file) return res.status(404).json({ error: "File not found" });
    if (String(file.project_id) !== String(projectId)) return res.status(400).json({ error: "Mismatched project" });

    // Ensure requester is project owner
    const { data: project, error: projectErr } = await supabase
      .from("ward_project")
      .select("user_id")
      .eq("id", projectId)
      .single();

    if (projectErr) {
      console.error("Error fetching project for auth:", projectErr);
      return res.status(400).json({ error: projectErr.message });
    }

    if (project.user_id !== user.id) return res.status(403).json({ error: "Not authorized" });

    // Delete from storage (ignore errors)
    if (file.path) {
      const { error: storageError } = await supabase.storage.from("ward").remove([file.path]);
      if (storageError) console.error("Storage remove error:", storageError);
    }

    // Delete DB row
    const { error } = await supabase.from("ward_project_file").delete().eq("id", fileId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}