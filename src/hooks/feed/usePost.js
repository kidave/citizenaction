"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function usePost(postId, initialPost) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    enabled: !!postId,
    initialData: initialPost,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post", {
        p_post_id: postId,
      });

      if (error) throw error;

      return Array.isArray(data) ? data[0] : data;
    },
  });
}
