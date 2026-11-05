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
        p_limit: 50000,
      };
      const rpcName = domain === undefined ? "get_governance_directory" : "get_governance_directory_by_domain";
      if (domain !== undefined) params.p_domain = domain;
      const result = await supabase.rpc(rpcName, params);
      if (!result || result.error) throw result?.error || new Error("Unable to load governance directory");
      const rows = result.data || [];
      if (tab !== "people" && tab !== "positions") return rows;
      const organizationIds = [...new Set(rows.map((row) => row.parent_id).filter(Boolean))];
      if (!organizationIds.length) return rows;
      const { data: organizations, error: organizationsError } = await supabase
        .from("governance").select("id,domain").in("id", organizationIds);
      if (organizationsError) throw organizationsError;
      const domainsById = new Map((organizations || []).map((item) => [item.id, item.domain]));
      return rows.map((row) => ({ ...row, domain: domainsById.get(row.parent_id) ?? null }));
    },
  });
}
