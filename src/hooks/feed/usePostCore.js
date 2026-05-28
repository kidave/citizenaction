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
        .from("feed_light_view")
        .select(
          `
            id,

            type,
            summary,
            details,

            attachments,

            created_at,
            updated_at,

            author_id,
            author_name,
            author_username,
            author_avatar,

            date,
            time,

            start_at,
            end_at,

            start_year,
            start_month,

            lifecycle_status,

            lat,
            lng,
            address,

            meeting_link
          `,
        )
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    staleTime: 1000 * 60 * 2,
  });
}
