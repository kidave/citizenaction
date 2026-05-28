"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

/**
 * Fetch spaces where current user is a member
 * Source of truth: space_member → space
 */
export function useUserSpaces({ enabled = true } = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-spaces", user?.id],
    enabled: enabled && !!user?.id,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_member")
        .select(
          `
          role,
          space:space_id (
            id,
            name,
            slug,
            logo_url,
            primary_color,
            is_active
          )
        `,
        )
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;

      // Flatten + filter
      return (data || [])
        .map((item) => item.space)
        .filter((space) => space && space.is_active);
    },
  });
}
