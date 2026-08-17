"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { deletePostAttachments } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useDeleteContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (contribution) => {
      if (!contribution?.id) {
        throw new Error("Contribution ID is required");
      }

      // -----------------------------------------
      // Delete storage files
      // -----------------------------------------

      const paths =
        contribution.attachments
          ?.map((attachment) => attachment?.storage_path)
          .filter(Boolean) ?? [];

      if (paths.length) {
        await deletePostAttachments(paths);
      }

      // -----------------------------------------
      // Delete contribution
      // -----------------------------------------

      const { error } = await supabase.rpc("delete_contribution", {
        p_contribution_id: contribution.id,
      });

      if (error) {
        throw error;
      }

      return true;
    },

    onSuccess: (_, contribution) => {
      queryClient.invalidateQueries({
        queryKey: ["contribution", contribution.post_id],
      });

      toast.success("Contribution deleted successfully");
    },

    onError: (error) => {
      console.error("Failed to delete contribution", error);

      toast.error(error?.message || "Failed to delete contribution");
    },
  });

  return {
    deleteContribution: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
