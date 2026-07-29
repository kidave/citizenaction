"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { deletePostAttachments } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useDeleteContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (contribution) => {
      const paths =
        contribution.attachments?.map((a) => a.storage_path).filter(Boolean) ??
        [];

      if (paths.length) {
        await deletePostAttachments(paths);
      }

      const { error } = await supabase.rpc("delete_contribution", {
        p_contribution_id: contribution.id,
      });

      if (error) throw error;

      return true;
    },

    onSuccess: (_, contribution) => {
      queryClient.invalidateQueries({
        queryKey: ["post-contributions", contribution.post_id],
      });

      toast.success("Contribution deleted successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to delete contribution");
    },
  });

  return {
    deleteContribution: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
