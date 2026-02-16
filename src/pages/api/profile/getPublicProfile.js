// pages/api/profile/getPublicProfile.js

import { createServerSupabase } from "lib/supabase/server";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("profile")
    .select(
      "username, name, avatar_url, designation, locality, created_at"
    )
    .ilike("username", username)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(data);
}
