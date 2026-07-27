"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostPermissions(postId) {
  return useQuery({
    queryKey: ["post-permissions", postId],
    enabled: !!postId,

    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return { can_manage: false };

      const { data, error } = await supabase.rpc("can_manage_post", {
        p_post_id: postId,
        p_user_id: userId,
      });

      if (error) throw error;

      return {
        can_manage: data ?? false,
      };
    },

    staleTime: 1000 * 60 * 5,
  });
}
