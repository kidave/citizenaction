// utils/supabaseNode.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // ensures .env.local loads when running node scripts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL");
if (!serviceRoleKey) throw new Error("❌ Missing SUPABASE_SERVICE_ROLE_KEY");

// Node-safe client (NO session, NO browser storage)
export const supabaseNode = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
