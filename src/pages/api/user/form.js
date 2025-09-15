// pages/api/user/form.js
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

    const { stakeholder_id, phone, country_code } = req.body;
    
    // Validate required fields with better error messages
    if (!stakeholder_id) {
      return res.status(400).json({ error: "Category selection is required" });
    }
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    if (!country_code) {
      return res.status(400).json({ error: "Country code is required" });
    }

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Call the stored procedure
    const { data, error: rpcError } = await supabase.rpc('submit_committee_form', {
      p_user_id: user.id,
      p_stakeholder_id: stakeholder_id,
      p_phone: phone,
      p_country_code: country_code
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return res.status(400).json({ error: rpcError.message });
    }

    if (data && data.length > 0) {
      const result = data[0];
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      return res.status(201).json({ 
        success: true, 
        form_id: result.form_id,
        message: "Application submitted successfully!" 
      });
    } else {
      return res.status(500).json({ error: "No data returned from stored procedure" });
    }
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}