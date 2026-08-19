"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      spaceId,
      name,
      slug,
      description,
      email,
      website,
      contact_number,
      logo_url,
      cover_url,
      primary_color,
    }) => {
      const { data, error } = await supabase
        .from("space")
        .update({
          name,
          slug,
          description,
          email,
          website,
          contact_number,
          logo_url,
          cover_url,
          primary_color,
        })
        .eq("id", spaceId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: (data) => {
      /*
       * Refresh Space queries.
       */

      queryClient.invalidateQueries({
        queryKey: ["spaces"],
      });

      /*
       * Also refresh the specific
       * Space query if it exists.
       */

      queryClient.invalidateQueries({
        queryKey: ["spaces", data.slug],
      });
    },
  });

  return {
    updateSpace: mutation.mutateAsync,

    isUpdating: mutation.isPending,
  };
}
