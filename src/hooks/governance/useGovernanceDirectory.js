import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useGovernanceDirectory({
  tab = "organizations",
  search = "",
  type = "all",
  entityType,
  categoryId = "all",
  geographyId = null,
  organizationId = null,
  domain = undefined,
  enabled = true,
} = {}) {
  const organizationType = type || entityType || "all";
  const effectiveCategoryId = tab === "organizations" ? categoryId : "all";

  return useQuery({
    queryKey: queryKeys.governance.directory({
      tab,
      search,
      type: organizationType,
      categoryId: effectiveCategoryId,
      geographyId,
      organizationId,
      domain,
    }),
    enabled,
    queryFn: async () => {
      const params = {
        p_search: search.trim() || null,
        p_tab: tab,
        p_type: tab === "organizations" && organizationType !== "all" ? organizationType : null,
        p_category_id: tab === "organizations" && effectiveCategoryId !== "all" ? effectiveCategoryId : null,
        p_geography_id: geographyId || null,
        p_organization_id: tab === "positions" || tab === "people" ? organizationId || null : null,
        p_limit: 500,
      };
      const rpcName = domain === undefined ? "get_governance_directory" : "get_governance_directory_by_domain";
      if (domain !== undefined) params.p_domain = domain;
      const result = await supabase.rpc(rpcName, params);
      if (!result || result.error) throw result?.error || new Error("Unable to load governance directory");
      return result.data || [];
    },
  });
}
