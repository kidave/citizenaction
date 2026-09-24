"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useUserPosts(userId) {
  return useQuery({
    queryKey: queryKeys.users.posts(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_posts", {
        p_user_id: userId,
      });

      if (error) throw error;

      return data || [];
    },
  });
}
