import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernance({
  search,
  type,
  entityType,
  parentId = null,
  includeAll = false,
  categoryId = null,
  enabled = true,
} = {}) {
  const governanceType = type || entityType || "all";

  return useQuery({
    queryKey: ["governance-directory", search, governanceType, parentId, includeAll, categoryId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_directory", {
        p_search: search || null,
        p_parent_id: parentId || null,
        p_type: governanceType && governanceType !== "all" ? governanceType : null,
        p_limit: 500,
        p_include_all: includeAll,
      });
      if (error) throw error;
      const rows = data || [];
      return rows.filter((entity) => !categoryId || entity.category_id === categoryId);
    },
  });
}
