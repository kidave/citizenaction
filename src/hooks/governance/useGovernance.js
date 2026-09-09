import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernance({ search, entityType, parentId = null, includeAll = false, categoryId = null, locationId = null, enabled = true } = {}) {
  return useQuery({
    queryKey: ["governance-directory-v2", search, entityType, parentId, includeAll, categoryId, locationId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_directory_v2", {
        p_search: search || null,
        p_parent_id: parentId || null,
        p_entity_type: entityType && entityType !== "all" ? entityType : null,
        p_limit: 500,
        p_include_all: includeAll,
      });
      if (error) throw error;
      const rows = data || [];
      return rows.filter((entity) => (!categoryId || entity.category_id === categoryId) && (!locationId || String(entity.location_id) === String(locationId)));
    },
  });
}
