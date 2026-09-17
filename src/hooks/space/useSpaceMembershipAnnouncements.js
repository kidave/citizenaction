"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useSpaceMembershipAnnouncements({ spaceId, enabled = true }) {
  return useQuery({
    queryKey: [...queryKeys.spaces.feed(spaceId), "membership-announcements"],
    enabled: enabled && !!spaceId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_space_membership_announcements",
        { p_space_id: spaceId },
      );

      if (error) throw error;

      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
