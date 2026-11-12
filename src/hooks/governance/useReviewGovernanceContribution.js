"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export function useReviewGovernanceContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ contributionId, status, reviewNotes = null }) => {
      const { data, error } = await supabase.rpc("review_governance_contribution", {
        p_contribution_id: contributionId,
        p_status: status,
        p_review_notes: reviewNotes,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-contributions"] });
      queryClient.invalidateQueries({ queryKey: ["governance-admin-state"] });
      queryClient.invalidateQueries({ queryKey: ["governance-directory"] });
      queryClient.invalidateQueries({ queryKey: ["governance"] });
      toast.success("Governance change reviewed");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to review governance change");
    },
  });

  return {
    reviewContribution: mutation.mutateAsync,
    isReviewing: mutation.isPending,
  };
}
