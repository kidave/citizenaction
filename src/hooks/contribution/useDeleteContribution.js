"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { deletePostAttachments } from "@/lib/supabase/storage";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

export function useDeleteContribution() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (contribution) => {
      if (!contribution?.id) throw new Error("Contribution ID is required");
      const paths = contribution.attachments?.map((attachment) => attachment?.storage_path).filter(Boolean) ?? [];
      if (paths.length) await deletePostAttachments(paths);
      const { error } = await supabase.rpc("delete_contribution", { p_contribution_id: contribution.id });
      if (error) throw error;
      return true;
    },
    onSuccess: (_, contribution) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contributions.detail(contribution.post_id) });
      toast.success("Contribution deleted successfully");
    },
    onError: (error) => {
      if (process.env.NODE_ENV !== "production") console.error("Failed to delete contribution", error);
      toast.error(error?.message || "Failed to delete contribution");
    },
  });

  return { deleteContribution: mutation.mutateAsync, isDeleting: mutation.isPending };
}
