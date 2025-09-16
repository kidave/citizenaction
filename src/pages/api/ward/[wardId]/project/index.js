// pages/api/ward/[wardId]/project/index.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  const { wardId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // 1. Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // 2. Check if user has ward role
  const { data: roleRow, error: roleError } = await supabase
    .from("committee")
    .select("role_id")
    .eq("ward_code", wardId)
    .eq("user_id", user.id)
    .single();

  const hasWardRole = roleRow && [1, 2, 3].includes(roleRow.role_id);
  // adjust role_id values as per your DB: 
  // e.g. 1=convenor, 2=co-convenor, 3=member

  if (!hasWardRole) {
    return res.status(403).json({
      error: "You are not a member of this ward committee",
    });
  }

  // 3. Handle methods
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .eq("ward_code", wardId);

    return error
      ? res.status(400).json({ error: error.message })
      : res.json(data);
  }

  if (req.method === "POST") {
    const { data, error } = await supabase
      .from("project")
      .insert([{ ...req.body, ward_code: wardId, user_id: user.id }])
      .select()
      .single();

    return error
      ? res.status(400).json({ error: error.message })
      : res.json(data);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
