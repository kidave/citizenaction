"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  uploadPostAttachments,
  deletePostAttachments,
} from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdateContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ contributionId, postId, contributionData }) => {
      let uploadedAttachments = [];

      try {
        // -----------------------------------------
        // Existing + new attachments
        // -----------------------------------------

        const existingAttachments =
          contributionData.attachments?.filter(
            (attachment) => attachment?.storage_path,
          ) ?? [];

        const newAttachments =
          contributionData.attachments?.filter(
            (attachment) => !attachment?.storage_path,
          ) ?? [];

        // -----------------------------------------
        // Upload new files
        // -----------------------------------------

        if (newAttachments.length) {
          uploadedAttachments = await uploadPostAttachments(
            postId,
            newAttachments,
          );
        }

        const finalAttachments = [
          ...existingAttachments,
          ...uploadedAttachments,
        ];

        // -----------------------------------------
        // Update contribution
        // -----------------------------------------

        const { data: contribution, error: contributionError } =
          await supabase.rpc("update_contribution", {
            p_contribution_id: contributionId,

            p_title: contributionData.title ?? null,

            p_content: contributionData.content ?? null,

            p_contribution_type:
              contributionData.contribution_type ?? "comment",

            p_status: contributionData.status ?? null,

            p_metadata: contributionData.metadata ?? {},

            p_start_at: contributionData.start_at ?? null,

            p_end_at: contributionData.end_at ?? null,

            p_lat: contributionData.lat ?? null,

            p_lng: contributionData.lng ?? null,

            p_address: contributionData.address ?? null,
          });

        if (contributionError) {
          throw contributionError;
        }

        // -----------------------------------------
        // Replace attachments
        // -----------------------------------------

        const { error: attachmentError } = await supabase.rpc(
          "upsert_contribution_attachments",
          {
            p_contribution_id: contributionId,
            p_attachments: finalAttachments,
          },
        );

        if (attachmentError) {
          throw attachmentError;
        }

        // -----------------------------------------
        // Replace links
        // -----------------------------------------

        const { error: linkError } = await supabase.rpc(
          "upsert_contribution_links",
          {
            p_contribution_id: contributionId,
            p_links: contributionData.links ?? [],
          },
        );

        if (linkError) {
          throw linkError;
        }

        return contribution;
      } catch (error) {
        // -----------------------------------------
        // Roll back newly uploaded files
        // -----------------------------------------

        if (uploadedAttachments.length) {
          try {
            await deletePostAttachments(
              uploadedAttachments
                .map((attachment) => attachment.storage_path)
                .filter(Boolean),
            );
          } catch (rollbackError) {
            console.error(
              "Contribution attachment rollback failed",
              rollbackError,
            );
          }
        }

        throw error;
      }
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contribution", variables.postId],
      });

      toast.success("Contribution updated successfully");
    },

    onError: (error) => {
      console.error("Failed to update contribution", error);

      toast.error(error?.message || "Failed to update contribution");
    },
  });

  return {
    updateContribution: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
