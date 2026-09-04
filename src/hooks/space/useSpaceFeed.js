"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useSpaceFeed(spaceId) {
  return useQuery({
    queryKey: ["space-feed", spaceId],

    enabled: !!spaceId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_space_posts", {
        p_space_id: spaceId,
      });

      if (error) {
        throw error;
      }

      return Array.isArray(data) ? data : [];
    },

    staleTime: 1000 * 60 * 5,
  });
}
