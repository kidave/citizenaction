import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import normalizePost from "@/utils/posts/normalizePost";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(normalizePost);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}