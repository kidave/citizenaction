// hooks/feed/usePost.js

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePost(id) {
  return useQuery({
    queryKey: ["post", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_detail_view")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}