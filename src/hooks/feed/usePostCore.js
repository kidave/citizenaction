"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostCore(id, initialData) {
  return useQuery({
    queryKey: ["post-core", id],
    enabled: !!id,
    initialData,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    },
  });
}