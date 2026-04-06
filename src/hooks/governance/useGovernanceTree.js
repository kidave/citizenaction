import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceTree({
  parentId = null,
  scopeType,
  scopeCode,
  search,
  entityType,
  enabled = true,
}) {
  return useQuery({
    queryKey: [
      "governance-tree",
      parentId,
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
        .order("label");

      // 🔹 hierarchy
      if (parentId) {
        query = query.eq("parent_id", parentId);
      } else {
        query = query.is("parent_id", null);
      }

      // 🔹 scope
      if (scopeType && scopeCode) {
        query = query
            .eq("geo_scope_type", scopeType)
            .eq("geo_scope_code", scopeCode);
      } else {
        query = query
            .eq("geo_scope_type", "country")
            .eq("geo_scope_code", "IN");
      }

      // 🔹 search overrides hierarchy
      if (search) {
        query = query.ilike("label", `%${search}%`);
      }

      if (entityType && entityType !== "all") {
        query = query.eq("entity_type", entityType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
  });
}