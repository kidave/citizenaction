import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useGovernanceOrganization({ governanceId, asOf = null, enabled = true } = {}) {
  return useQuery({
    queryKey: ["governance-organization", governanceId, asOf],
    enabled: enabled && !!governanceId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_organization_tree", {
        p_governance_id: governanceId,
        p_at: asOf || new Date().toISOString(),
      });
      if (error) throw error;
      return data || [];
    },
  });
}
