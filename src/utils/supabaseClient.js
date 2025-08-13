// utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) =>
        typeof window !== "undefined" ? localStorage.getItem(key) : null,
      setItem: (key, value) => {
        if (typeof window !== "undefined") localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        if (typeof window !== "undefined") localStorage.removeItem(key);
      },
    },
  },
});
