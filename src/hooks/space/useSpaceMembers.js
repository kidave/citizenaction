"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

/**
 * Fetch members of a space
 * Source of truth:
 * space_member → profile
 */
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
          .from("space_member")
          .select(`
            role,
            is_active,
            is_suspended,
            created_at,

            profile:user_id (
              user_id,
              username,
              name,
              avatar_url,
              designation,
              locality
            )
          `)
          .eq("space_id", spaceId)
          .eq("is_active", true)
          .eq("is_suspended", false)
          .order("created_at", {
            ascending: false,
          });

      if (error) throw error;

      // Flatten + filter
      return (data || [])
        .map((item) => ({
          ...item.profile,

          role: item.role,

          joined_at:
            item.created_at,
        }))
        .filter(Boolean);
    },

    staleTime: 1000 * 60 * 5,
  });
}