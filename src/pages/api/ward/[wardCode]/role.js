import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const supabase = createServerSupabase(token);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const { data, error } = await supabase
    .from("committee")
    .select("role_id")
    .eq("user_id", user.id)
    .eq("ward_code", wardCode)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ role_id: data?.role_id || null });
}
