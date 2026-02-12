// hooks/useClubs.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useClubs({
  communitySlug,
  scopeType,
  scopeCode,
  search,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: [
      "clubs",
      communitySlug,
      scopeType,
      scopeCode,
      search,
    ],
    enabled,
    queryFn: async () => {
      let query = supabase
        .from("community_committee_public")
        .select("*")
        .eq("is_active", true);

      if (communitySlug && communitySlug !== "all") {
        query = query.eq("community_slug", communitySlug);
      }

      if (scopeType && scopeType !== "all") {
        query = query.eq("scope_type", scopeType);
      }

      if (scopeCode) {
        query = query.eq("scope_code", scopeCode);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
  });
}
