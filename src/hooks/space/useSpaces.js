// hooks/space/useSpaces.js

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/lib/queryKeys";

export function useSpaces({
  slug,
  search,
  privateAccess = false,
  includeInactive = false,
  enabled = true,
} = {}) {
  const { user, loading: authLoading } = useAuth();

  const queryKey = slug
    ? queryKeys.spaces.detail({
        slug,
        privateAccess,
        includeInactive,
        userId: user?.id,
      })
    : queryKeys.spaces.list({
        search,
        privateAccess,
        includeInactive,
        userId: user?.id,
      });

  return useQuery({
    queryKey,
    enabled: enabled && !authLoading && (!slug || typeof slug === "string"),
    queryFn: async () => {
      const table = privateAccess ? "space" : "space_public_view";

      let query = supabase.from(table).select("*");

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      if (slug) {
        query = query.eq("slug", slug).maybeSingle();
      } else {
        query = query.order("created_at", { ascending: false });
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
