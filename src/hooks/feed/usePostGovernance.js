"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostGovernance(postId) {
  return useQuery({
    queryKey: ["post-governance", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_governance")
        .select(
          `
          governance (
            id,
            name,
            short_name,
            slug,
            image_url,
            entity_type
          )
        `,
        )
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
