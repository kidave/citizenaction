// pages/api/profile/getProfile.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const supabase = createServerSupabase(token);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { data, error } = await supabase
    .from("profile")
    .select("user_id, email, avatar_url, designation, locality, social, mobile, country_code, name, created_at")
    .eq("user_id", user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data || {});
}
