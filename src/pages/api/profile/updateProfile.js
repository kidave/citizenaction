// pages/api/profile/update.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabase(req.headers.authorization);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { name, designation, social, mobile, country_code, avatar_url } = req.body;

  // Basic validation
  if (mobile && mobile.length > 20) {
    return res.status(400).json({ error: "Mobile number too long" });
  }

  const { data, error } = await supabase
    .from("profile")
    .upsert(
      {
        user_id: user.id,
        name,
        designation,
        social,
        mobile,
        country_code,
        avatar_url,
        email: user.email, // always sync email from auth
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
}
