// hooks/feed/usePostGovernance.js

"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostGovernance(postId) {
  return useQuery({
    queryKey: ["post-governance", postId],
    enabled: !!postId,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_governance_entities")
        .select(`
          governance_entities (
            id,
            label,
            image_url
          )
        `)
        .eq("feed_id", postId);

      if (error) throw error;

      return data?.map(
        (d) => d.governance_entities
      ) || [];
    },
  });
}