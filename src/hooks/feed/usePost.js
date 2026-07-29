"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePost(id, initialData) {
  return useQuery({
    queryKey: ["post", id],
    enabled: !!id,
    initialData,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post", {
        p_post_id: id,
      });

      if (error) throw error;

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
