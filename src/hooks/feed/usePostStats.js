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
        p_user_id: userId,
      });

      if (error) throw error;

      return (
        data ?? {
          support_count: 0,
          contribution_count: 0,
          contributor_count: 0,
          is_supported: false,
          contributors_preview: [],
        }
      );
    },

    staleTime: 1000 * 60 * 5,
  });
}
