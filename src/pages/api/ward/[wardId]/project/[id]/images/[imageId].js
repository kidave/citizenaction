// pages/api/ward/[wardId]/projects/[id]/images/[imageId].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId, id: projectId, imageId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "DELETE") {
    // Validate existence and optional ownership
    const { data: img, error: fetchError } = await supabase
      .from("project_images")
      .select("id, path, project_id")
      .eq("id", imageId)
      .single();

    if (fetchError || !img) return res.status(404).json({ error: "Image not found" });
    if (String(img.project_id) !== String(projectId)) return res.status(400).json({ error: "Mismatched project" });

    // Optional: ensure requester is project owner
    const { data: project, error: projectErr } = await supabase
      .from("project")
      .select("user_id")
      .eq("id", projectId)
      .single();

    if (projectErr) {
      console.error("Error fetching project for auth:", projectErr);
      return res.status(400).json({ error: projectErr.message });
    }

    if (project.user_id !== user.id) return res.status(403).json({ error: "Not authorized" });

    // delete from storage (ignore errors)
    if (img.path) {
      const { error: storageError } = await supabase.storage.from("ward").remove([img.path]);
      if (storageError) console.error("Storage remove error:", storageError);
    }

    // delete DB row
    const { error } = await supabase.from("project_images").delete().eq("id", imageId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
