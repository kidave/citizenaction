"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostStats(postId, userId) {
  return useQuery({
    queryKey: ["post-stats", postId, userId],
    enabled: !!postId,
    queryFn: async () => {
      const [supportRes, contributeRes] = await Promise.all([
        supabase
          .from("action_support")
          .select("user_id", { count: "exact" })
          .eq("action_id", postId),

        supabase
          .from("action_contribute")
          .select("user_id", { count: "exact" })
          .eq("action_id", postId),
      ]);

      return {
        support_count: supportRes.count || 0,
        contribute_count: contributeRes.count || 0,
        is_supported:
          supportRes.data?.some((s) => s.user_id === userId) || false,
        is_contributing:
          contributeRes.data?.some((c) => c.user_id === userId) || false,
      };
    },
  });
}
