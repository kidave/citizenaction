// pages/api/ward/[wardCode]/committee/[id].js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardCode, id } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "PUT") {
    const { data, error } = await supabase
      .from("committee")
      .update(req.body)
      .eq("id", id)
      .eq("ward_code", wardCode)
      .select()
      .single();
    return error ? res.status(400).json({ error: error.message }) : res.json(data);
  }

  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("committee")
      .delete()
      .eq("id", id)
      .eq("ward_code", wardCode);
    return error ? res.status(400).json({ error: error.message }) : res.json({ success: true });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
