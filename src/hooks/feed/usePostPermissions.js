"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostPermissions(postId) {
  return useQuery({
    queryKey: ["post-permissions", postId],
    enabled: !!postId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("can_manage_feed", {
        feed_id: postId,
      });

      if (error) throw error;

      return {
        can_manage: data ?? false,
      };
    },

    staleTime: 1000 * 60 * 5,
  });
}
