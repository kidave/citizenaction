import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useGovernanceOrganizationContext({ governanceId, asOf = null, enabled = true } = {}) {
  return useQuery({
    queryKey: ["governance-organization-context", governanceId, asOf],
    enabled: enabled && !!governanceId,
    queryFn: async () => {
      const result = await supabase.rpc("get_governance_organization_context", {
        p_governance_id: governanceId,
        p_at: asOf || new Date().toISOString(),
      });

      if (!result || result.error) {
        throw result?.error || new Error("Unable to load organization context");
      }

      return {
        organizations: result.data?.organizations || [],
        appointments: result.data?.appointments || [],
      };
    },
  });
}
