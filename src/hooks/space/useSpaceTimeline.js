"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useSpaceTimeline(spaceId) {
  return useQuery({
    queryKey: ["space-timeline", spaceId],
    enabled: !!spaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_timeline_view")
        .select("*")
        .eq("space_id", spaceId)
        .order("occurred_at", { ascending: true });

      if (error) throw error;

      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
