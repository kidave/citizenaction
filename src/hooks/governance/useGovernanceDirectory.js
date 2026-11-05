import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

async function attachOrganizationDomains(rows, tab) {
  if (tab !== "people" && tab !== "positions") return rows;
  const organizationIds = [...new Set(rows.map((row) => row.parent_id).filter(Boolean))];
  if (!organizationIds.length) return rows;
  const { data: organizations, error } = await supabase
    .from("governance").select("id,domain").in("id", organizationIds);
  if (error) throw error;
  const domainsById = new Map((organizations || []).map((item) => [item.id, item.domain]));
  return rows.map((row) => ({ ...row, domain: domainsById.get(row.parent_id) ?? null }));
}

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
  page = null,
  pageSize = null,
  currentOnly = false,
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
      page,
      pageSize,
      currentOnly,
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
      };
      const usePagination = page != null && pageSize != null && domain !== undefined;
      if (usePagination) {
        const result = await supabase.rpc("get_governance_directory_page", {
          ...params,
          p_page_size: pageSize,
          p_offset: Math.max(0, (page - 1) * pageSize),
          p_domain: domain,
          p_current_only: currentOnly,
        });
        if (!result || result.error) throw result?.error || new Error("Unable to load governance directory");
        const rows = result.data || [];
        const totalCount = Number(rows[0]?.total_count || 0);
        const cleanRows = rows.map(({ total_count, ...row }) => row);
        return { rows: await attachOrganizationDomains(cleanRows, tab), totalCount };
      }

      const rpcName = domain === undefined ? "get_governance_directory" : "get_governance_directory_by_domain";
      if (domain !== undefined) params.p_domain = domain;
      params.p_limit = 500;
      const result = await supabase.rpc(rpcName, params);
      if (!result || result.error) throw result?.error || new Error("Unable to load governance directory");
      return attachOrganizationDomains(result.data || [], tab);
    },
  });
}
