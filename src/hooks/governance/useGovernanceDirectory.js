import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceDirectory({
  tab = "organizations",
  search = "",
  type = "all",
  entityType,
  categoryId = "all",
  geographyId = null,
  organizationId = null,
  enabled = true,
} = {}) {
  const organizationType = type || entityType || "all";
  const effectiveCategoryId = tab === "organizations" ? categoryId : "all";

  return useQuery({
    queryKey: ["governance-directory-v2", tab, search, organizationType, effectiveCategoryId, geographyId, organizationId],
    enabled,
    queryFn: async () => {
      const result = await supabase.rpc("get_governance_directory_v2", {
        p_search: search.trim() || null,
        p_tab: tab,
        p_type: tab === "organizations" && organizationType !== "all" ? organizationType : null,
        p_category_id: tab === "organizations" && effectiveCategoryId !== "all" ? effectiveCategoryId : null,
        p_geography_id: geographyId || null,
        p_organization_id: tab === "positions" ? organizationId || null : null,
        p_limit: 500,
      });
      if (!result || result.error) throw result?.error || new Error("Unable to load governance directory");
      return result.data || [];
    },
  });
}
