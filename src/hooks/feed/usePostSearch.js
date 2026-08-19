"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostSearch(search) {
  const trimmedSearch = search.trim();

  return useQuery({
    queryKey: ["post-search", trimmedSearch],

    enabled: trimmedSearch.length >= 2,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_posts", {
        p_search: trimmedSearch,
        p_limit: 8,
      });

      if (error) {
        throw error;
      }

      return data || [];
    },

    staleTime: 1000 * 30,
  });
}
