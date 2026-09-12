"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceTree({ parentId = null, search, type = null, entityType = null, enabled = true } = {}) {
  const governanceType = type || entityType;

  return useQuery({
    queryKey: ["governance-tree", parentId, search, governanceType],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_directory", {
        p_search: search || null,
        p_parent_id: parentId || null,
        p_type: governanceType && governanceType !== "all" ? governanceType : null,
        p_limit: 100,
      });

      if (error) throw error;
      return data || [];
    },
  });
}
