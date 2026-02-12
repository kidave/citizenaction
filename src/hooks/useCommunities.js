// hooks/useCommunities.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useCommunities({ slug, search, privateAccess = false, enabled = true } = {}) {
  return useQuery({
    queryKey: ["communities", slug, search, privateAccess],
    enabled,
    queryFn: async () => {
      const table = privateAccess ? "community" : "community_public";
      let query = supabase.from(table).select("*");

      if (slug) {
        query = query.eq("slug", slug).single();
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    },
  });
}
