import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function usePersonMutations() {
  const queryClient = useQueryClient();

  const createPersonMutation = useMutation({
    mutationFn: async (params) => {
      const { data, error } = await supabase.rpc("create_person", params);
      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.all });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: async (params) => {
      const { data, error } = await supabase.rpc("update_person", params);
      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    },
    onSuccess: (data) => {
      if (data?.slug) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.governance.person(data.slug),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.all });
    },
  });

  return {
    createPerson: createPersonMutation.mutateAsync,
    updatePerson: updatePersonMutation.mutateAsync,
    isCreatingPerson: createPersonMutation.isPending,
    isUpdatingPerson: updatePersonMutation.isPending,
  };
}
