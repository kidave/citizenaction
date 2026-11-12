"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useContributionPermissions(contributionId) {
  return useQuery({
    queryKey: ["contribution-permissions", contributionId],
    enabled: !!contributionId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("can_manage_contribution", {
        p_contribution_id: contributionId,
      });

      if (error) throw error;

      return {
        can_manage: data,
      };
    },

    staleTime: 1000 * 60 * 5,
  });
}
