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
  initialData = undefined,
  enabled = true,
} = {}) {
  const organizationType = type || entityType || "all";
  const effectiveCategoryId = tab === "organizations" ? categoryId : "all";
  const canUseInitialData = Array.isArray(initialData)
    && !search.trim()
    && organizationType === "all"
    && effectiveCategoryId === "all"
    && !geographyId
    && !organizationId;

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
    initialData: canUseInitialData ? initialData : undefined,
    staleTime: canUseInitialData ? 30_000 : 0,
    queryFn: async () => {
      const rpcName = domain === undefined ? "get_governance_directory" : "get_governance_directory_by_domain";
      const result = await supabase.rpc(rpcName, {
        p_search: search.trim() || null,
        p_tab: tab,
        p_type: tab === "organizations" && organizationType !== "all" ? organizationType : null,
        p_category_id: tab === "organizations" && effectiveCategoryId !== "all¶»§q«^