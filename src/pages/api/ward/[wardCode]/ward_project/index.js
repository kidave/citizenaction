// pages/api/ward/[wardCode]/ward_project/index.js
import { createServerSupabase } from "utils/supabaseServer"; // ← Fix import

export default async function handler(req, res) {
  const { wardCode } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Authentication check
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("ward_project")
      .select("*")
      .eq("ward_code", wardCode)
      .order("created_at", { ascending: false });

    return error
      ? res.status(400).json({ error: error.message })
      : res.json(data);
  }

  if (req.method === "POST") {
    try {
      const projectData = {
        ...req.body,
        ward_code: wardCode,
        user_id: user.id
      };

      // Ensure required fields
      if (!projectData.title) {
        return res.status(400).json({ error: "Project title is required" });
      }

      const { data, error } = await supabase
        .from("ward_project")
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error("Project creation error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}