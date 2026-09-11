import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceEntityMutation() {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: async ({ entity, draft }) => {
      const { data, error } = await supabase.rpc(
        "update_governance_entity",
        {
          p_entity_id: entity.id,
          p_name: draft.name.trim(),
          p_short_name: draft.short_name.trim() || null,
          p_description: draft.description.trim() || null,
          p_website: draft.website.trim() || null,
          p_entity_type: draft.entity_type,
          p_status: draft.status,
          p_valid_from: `${draft.valid_from}T00:00:00Z`,
          p_valid_to: draft.valid_to
            ? `${draft.valid_to}T23:59:59.999Z`
            : null,
          p_image_url: draft.image_url || null,
          p_category_id: draft.category_id || null,
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["governance-entity-details", variables.entity.id],
      });
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (entityId) => {
      const { error } = await supabase.rpc(
        "delete_governance_entity",
        { p_entity_id: entityId },
      );

      if (error) throw error;
    },
    onSuccess: (_, entityId) => {
      queryClient.removeQueries({
        queryKey: ["governance-entity-details", entityId],
      });
    },
  });

  return {
    updateEntity: update.mutateAsync,
    deleteEntity: remove.mutateAsync,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
