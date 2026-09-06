import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernance({
  scopeType,
  scopeCode,
  search,
  entityType,
  parentId = null,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: [
      "governance-directory",
      scopeType,
      scopeCode,
      search,
      entityType,
      parentId,
    ],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_directory", {
        p_search: search || null,
        p_parent_entity_id: parentId || null,
        p_scope_type: scopeType || null,
        p_scope_code: scopeCode || null,
        p_entity_type: entityType && entityType !== "all" ? entityType : null,
        p_limit: 100,
      });

      if (error) throw error;
      return data || [];
    },
  });
}
