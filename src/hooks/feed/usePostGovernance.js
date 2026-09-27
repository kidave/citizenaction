"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function usePostGovernance(postId) {
  return useQuery({
    queryKey: queryKeys.posts.governance(postId),
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_governance")
        .select(`governance (id, name, short_name, slug, image_url, type)`)
        .eq("post_id", postId);

      if (error) throw error;

      return (
        data
          ?.map((row) =>
            row.governance
              ? { ...row.governance, label: row.governance.name }
              : null,
          )
          .filter(Boolean) || []
      );
    },
  });
}
