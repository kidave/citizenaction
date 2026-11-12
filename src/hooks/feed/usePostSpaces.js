"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function usePostSpaces(postId) {
  return useQuery({
    queryKey: queryKeys.posts.spaces(postId),
    enabled: !!postId,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_space")
        .select(
          `
          space:space_id (
            id,
            name,
            slug,
            logo_url
          )
        `,
        )
        .eq("post_id", postId);

      if (error) throw error;

      return (data || []).map((x) => x.space).filter(Boolean);
    },
  });
}
