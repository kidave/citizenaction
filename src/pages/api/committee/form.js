// pages/api/committee/form.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const supabase = createServerSupabase(token);

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check for existing pending application
    const { data: existing, error: existingError } = await supabase
      .from("committee_form")
      .select("id")
      .eq("user_id", user.id)
      .eq("application_status", "Pending")
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return res
        .status(400)
        .json({ error: "You already have a pending application" });
    }

    const { ward_code, stakeholder_id, phone, country_code } = req.body;
    if (!ward_code || !stakeholder_id || !phone || !country_code) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("committee_form")
      .insert({
        user_id: user.id,
        ward_code,
        stakeholder_id,
        phone,
        country_code,
        application_status: "Pending",
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
