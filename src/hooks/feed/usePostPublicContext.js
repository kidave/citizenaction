"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostPublicContext(postId, initialContext = null) {
  return useQuery({
    queryKey: ["post-public-context", postId],
    enabled: !!postId,
    initialData: initialContext || undefined,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post_public_context", {
        p_post_id: postId,
      });
      if (error) throw error;
      return data || { categories: [], geography: [] };
    },
  });
}
