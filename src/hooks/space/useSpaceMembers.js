"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useSpaceMembers({
  spaceId,
  enabled = true,
}) {
  return useQuery({
    queryKey: [
      "space-members",
      spaceId,
    ],

    enabled:
      enabled && !!spaceId,

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from("space_member_view")
          .select("*")
          .eq("space_id", spaceId)
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.error(error);

        throw error;
      }

      return data || [];
    },

    staleTime: 1000 * 60 * 5,
  });
}