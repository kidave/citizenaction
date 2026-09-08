import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernance({
  search,
  entityType,
  parentId = null,
  includeAll = false,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ["governance-directory", search, entityType, parentId, includeAll],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_directory", {
        p_search: search || null,
        p_parent_id: parentId || null,
        p_entity_type: entityType && entityType !== "all" ? entityType : null,
        p_include_all: includeAll,
        p_limit: 100,
      });

      if (error) throw error;

      return (data || []).map((entity) => ({
        ...entity,
        image_url: entity.image_url || entity.metadata?.image_url || null,
      }));
    },
  });
}
