// hooks/space/useSpaces.js

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";

export function useSpaces({
  slug,
  search,
  privateAccess = false,
  includeInactive = false,
  enabled = true,
} = {}) {
  const { user, authLoading } = useAuth();

  return useQuery({
    queryKey: [
      "spaces",
      slug,
      search,
      privateAccess,
      includeInactive,
      user?.id,
    ],

    enabled: enabled && !authLoading,

    queryFn: async () => {
      const table = privateAccess ? "space" : "space_public_view";

      let query = supabase.from(table).select("*").order("created_at", {
        ascending: false,
      });

      /*
       * Normal public access only sees
       * active Spaces.
       *
       * Private/admin access can optionally
       * include inactive Spaces.
       */

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      if (slug) {
        query = query.eq("slug", slug).single();
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
