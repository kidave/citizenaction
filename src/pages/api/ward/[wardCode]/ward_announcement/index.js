// pages/api/ward/[wardCode]/announcement/index.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    try {
      // For GET requests, don't require authentication for published announcements
      const { data, error } = await supabase
        .from("ward_announcement_with_files")
        .select("*")
        .eq("ward_code", wardCode)
        .eq("is_published", true)
        .order("scheduled_date", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.json(data);
    } catch (error) {
      console.error("Unexpected error in GET handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { data, error } = await supabase
        .from("ward_announcement")
        .insert([{ ...req.body, ward_code: wardCode, user_id: user.id }])
        .select(`
          *,
          ward_announcement_file (*)
        `)  // Include related files in response (consistent with meetings)
        .single();

      if (error) {
        console.error("Error creating announcement:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(201).json(data);
    } catch (error) {
      console.error("Unexpected error in POST handler:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}