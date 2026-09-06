"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceTree({
  parentId = null,
  scopes = [],
  search,
  entityType = null,
  enabled = true,
} = {}) {
  const scope = scopes?.[0] || {};

  return useQuery({
    queryKey: ["governance-tree", parentId, scope.type, scope.code, search, entityType],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_directory", {
        p_search: search || null,
        p_parent_entity_id: parentId || null,
        p_scope_type: scope.type || null,
        p_scope_code: scope.code || null,
        p_entity_type: entityType && entityType !== "all" ? entityType : null,
        p_limit: 100,
      });

      if (error) throw error;
      return data || [];
    },
  });
}
