"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useContribution(postId) {
  return useQuery({
    queryKey: ["contribution", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_contribution", {
        p_post_id: postId,
      });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
