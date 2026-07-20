"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostContribution(postId) {
  return useQuery({
    queryKey: ["post-contribution", postId],

    enabled: !!postId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post_contributions", {
        p_post_id: postId,
      });

      if (error) throw error;

      return data || [];
    },
  });
}
