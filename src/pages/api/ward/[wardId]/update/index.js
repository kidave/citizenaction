// pages/api/ward/[wardId]/meeting/index.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // Authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("update")
      .select("*")
      .eq("ward_code", wardId)
      .order("date", { ascending: false });
    return error ? res.status(400).json({ error: error.message }) : res.json(data);
  }

  if (req.method === "POST") {
    const { data, error } = await supabase
      .from("update")
      .insert([{ ...req.body, ward_code: wardId, created_by: user.id }])
      .select()
      .single();
    return error ? res.status(400).json({ error: error.message }) : res.json(data);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
