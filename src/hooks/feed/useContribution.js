"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useContribution(postId) {
  return useQuery({
    queryKey: queryKeys.contributions.detail(postId),
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_contribution", {
        p_post_id: postId,
      });

      if (error) throw error;

      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
