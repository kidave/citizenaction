// pages/api/user/form.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const supabase = createServerSupabase(token);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const {
      stakeholder,
      mobile,
      country_code,
      locality,
      designation,
      contribution,
      skills,
      expectations
    } = req.body;

    // Required validations
    if (!stakeholder) return res.status(400).json({ error: "Category is required" });
    if (!mobile) return res.status(400).json({ error: "Mobile number is required" });
    if (!locality) return res.status(400).json({ error: "Locality is required" });
    if (!designation) return res.status(400).json({ error: "Designation is required" });

    // Phone format check
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(mobile)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Call RPC
    const { data, error: rpcError } = await supabase.rpc(
      "submit_committee_form",
      {
        p_user_id: user.id,
        p_stakeholder: stakeholder,
        p_mobile: mobile,
        p_country_code: country_code,
        p_locality: locality,
        p_designation: designation,
        p_contribution: contribution || null,
        p_skills: skills || null,
        p_expectations: expectations || null
      }
    );

    if (rpcError) {
      console.error(rpcError);
      return res.status(400).json({ error: rpcError.message });
    }

    const result = data?.[0];
    if (!result) {
      return res.status(500).json({ error: "Unexpected server response" });
    }

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.status(201).json({
      success: true,
      form_id: result.form_id,
      message: result.message
    });

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
