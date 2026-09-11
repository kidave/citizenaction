import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceDirectory({
  tab = "entities",
  search = "",
  entityType = "all",
  categoryId = "all",
  geographyId = "all",
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ["governance-directory-v2", tab, search, entityType, categoryId, geographyId],
    enabled,
    queryFn: async () => {
      const result = await supabase.rpc("get_governance_directory_v2", {
        p_search: search.trim() || null,
        p_tab: tab,
        p_entity_type: entityType === "all" ? null : entityType,
        p_category_id: categoryId === "all" ? null : categoryId,
        p_geography_id: geographyId === "all" ? null : geographyId,
        p_limit: 500,
      });

      if (!result || result.error) {
        throw result?.error || new Error("Unable to load governance directory");
      }

      return result.data || [];
    },
  });
}
