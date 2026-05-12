"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostSpaces(postId) {
  return useQuery({
    queryKey: ["post-spaces", postId],

    enabled: !!postId,

    queryFn: async () => {

      const { data, error } = await supabase
        .from("feed_space")
        .select(`
          space:space_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq("feed_id", postId);

      if (error) {
        throw error;
      }

      return (data || [])
        .map((x) => x.space)
        .filter(Boolean);
    },
  });
}