// utils/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client scoped to a user session
 * @param {string} accessToken - JWT from client Authorization header
 */
export function createServerSupabase(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Safe in API routes (not in browser!)
    {
      global: {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : ''
        }
      }
    }
  );
}
