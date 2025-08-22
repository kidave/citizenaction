// pages/api/auth/clear-session.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createServerSupabase(req, res);

  // Clear cookie
  await supabase.auth.signOut();
  res.status(200).json({ ok: true });
}
