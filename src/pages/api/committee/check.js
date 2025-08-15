// pages/api/committee/check.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    console.log("🔍 AUTH HEADER:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    console.log("🔍 EXTRACTED TOKEN:", token);

    if (!token) {
      console.warn("❌ No token received");
      return res.status(401).json({ error: "Not authenticated - no token" });
    }

    const supabase = createServerSupabase(token);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔍 USER:", user);
    console.log("🔍 AUTH ERROR:", authError);

    if (authError || !user) {
      console.warn("❌ User not authenticated");
      return res
        .status(401)
        .json({ error: "Invalid token or user not found" });
    }

    // Call the RPC
    const { data, error } = await supabase.rpc("check_committee_status", {
      user_id: user.id,
    });

    console.log("🔍 RPC DATA:", data);
    console.log("🔍 RPC ERROR:", error);

    if (error) {
      console.error("❌ RPC Call failed:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
