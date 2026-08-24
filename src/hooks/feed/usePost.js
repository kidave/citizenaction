"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePost(postId, initialPost) {
  return useQuery({
    queryKey: ["post", postId],

    enabled: !!postId,

    initialData: initialPost,

    staleTime: 1000 * 60 * 5,

    refetchOnMount: false,
    refetchOnWindowFocus: false,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post", {
        p_post_id: postId,
      });

      if (error) {
        throw error;
      }

      return Array.isArray(data) ? data[0] : data;
    },
  });
}
