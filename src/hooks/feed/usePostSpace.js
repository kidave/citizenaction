"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostSpace(spaceId) {
  return useQuery({
    queryKey: ["post-space", spaceId],
    enabled: !!spaceId,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("space")
        .select("id, name, slug, logo_url")
        .eq("id", spaceId)
        .single();

      if (error) throw error;

      return data;
    },
  });
}
