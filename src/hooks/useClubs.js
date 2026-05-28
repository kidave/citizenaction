// hooks/useClubs.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useClubs({
  spaceSlug,
  scopeType,
  scopeCode,
  search,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ["clubs", spaceSlug, scopeType, scopeCode, search],
    enabled,
    queryFn: async () => {
      let query = supabase.from("club_view").select("*").eq("is_active", true);

      if (spaceSlug && spaceSlug !== "all") {
        query = query.eq("space_slug", spaceSlug);
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
