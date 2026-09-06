"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useGovernanceContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      summary,
      action = "edit",
      proposedEntityType = null,
      proposedEntityId = null,
      proposedParentEntityId = null,
      proposedChanges = {},
      sourceUrl = null,
      sourceNotes = null,
    }) => {
      const { data, error } = await supabase.rpc("submit_governance_contribution", {
        p_summary: summary,
        p_action: action,
        p_proposed_entity_type: proposedEntityType,
        p_proposed_entity_id: proposedEntityId,
        p_proposed_parent_entity_id: proposedParentEntityId,
        p_proposed_changes: proposedChanges,
        p_source_url: sourceUrl,
        p_source_notes: sourceNotes,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-directory"] });
      toast.success("Suggestion submitted for review");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to submit suggestion");
    },
  });

  return {
    submitContribution: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
