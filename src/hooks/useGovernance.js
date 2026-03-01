import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernance({
  scopeType,
  scopeCode,
  search,
  entityType,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: [
      "governance-directory",
      scopeType,
      scopeCode,
      search,
      entityType,
    ],
    enabled,
    queryFn: async () => {
      let query = supabase
        .from("governance_entity_view")
        .select("*")
        .order("label", { ascending: true });

      if (scopeType && scopeCode) {
        query = query
          .eq("geo_scope_type", scopeType)
          .eq("geo_scope_code", scopeCode);
      }

      if (entityType && entityType !== "all") {
        query = query.eq("entity_type", entityType);
      }

      if (search) {
        query = query.ilike("label", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}