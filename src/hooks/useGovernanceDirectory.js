import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceDirectory({
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
        .from("governance_entities")
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
        query = query.or(`
          label.ilike.%${search}%,
          entity_type.ilike.%${search}%,
          department.ilike.%${search}%,
          designation.ilike.%${search}%
        `);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
  });
}
