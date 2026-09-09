import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernance({ search, entityType, parentId = null, includeAll = false, categoryId = null, locationId = null, rootsOnly = false, asOf = null, enabled = true } = {}) {
  return useQuery({
    queryKey: ["governance-directory-v2", search, entityType, parentId, includeAll, categoryId, locationId, rootsOnly, asOf],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_directory", {
        p_search: search || null,
        p_entity_type: entityType || "all",
        p_category_id: categoryId || null,
        p_roots_only: rootsOnly,
        p_as_of: asOf || new Date().toISOString(),
      });
      if (!error) return data || [];

      const { data: legacyData, error: legacyError } = await supabase.rpc("get_governance_directory_v2", {
        p_search: search || null,
        p_parent_id: parentId || null,
        p_entity_type: entityType && entityType !== "all" ? entityType : null,
        p_limit: 500,
        p_include_all: includeAll,
      });
      if (legacyError) throw error;
      const rows = legacyData || [];
      return rows.filter((entity) => (!categoryId || entity.category_id === categoryId) && (!locationId || String(entity.location_id) === String(locationId)));
    },
  });
}
