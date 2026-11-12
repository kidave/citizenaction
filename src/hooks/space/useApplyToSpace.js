"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useApplyToSpace() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ spaceId, message }) => {
      const { data, error } = await supabase.rpc("apply_to_space", {
        p_space_id: spaceId,
        p_message: message,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spaces.all });
    },
  });

  return {
    applyToSpace: mutation.mutateAsync,
    isApplying: mutation.isPending,
  };
}
