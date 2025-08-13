// getProfile.js - improved version
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const supabase = createServerSupabase(req.headers.authorization);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data || {});
}
