// lib/supabase/server.js
import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client scoped to a user session
 * @param {string} accessToken - JWT from client Authorization header
 */
export function createServerSupabase(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      },
    },
  );
}
