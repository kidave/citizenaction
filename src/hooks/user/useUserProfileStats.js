"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useUserProfileStats(userId) {
  return useQuery({
    queryKey: ["user-profile-stats", userId],
    enabled: !!userId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_profile_stats", {
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      return (
        data?.[0] || {
          post_count: 0,
          contribution_count: 0,
          space_count: 0,
        }
      );
    },
  });
}
