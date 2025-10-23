import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { data, error } = await supabase
      .from("update_view")
      .select("*")
      .eq("ward_code", wardId)
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch updates" });
  }
}