"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostStats(postId, userId) {
  return useQuery({
    queryKey: ["post-stats", postId, userId],
    enabled: !!postId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post_stats", {
        p_post_id: postId,
        p_author_id: userId,
      });

      if (error) throw error;

      return data;
    },
  });
}
