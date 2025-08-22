// pages/api/auth/set-session.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { session } = req.body;
  const supabase = createServerSupabase(req, res);

  // Write cookie
  if (session) {
    await supabase.auth.setSession(session);
  }
  res.status(200).json({ ok: true });
}
