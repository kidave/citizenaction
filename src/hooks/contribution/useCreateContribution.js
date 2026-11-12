"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  uploadPostAttachments,
  deletePostAttachments,
} from "@/lib/supabase/storage";
import { resolveEditorImageUrls } from "@/components/editor/resolveEditorImageUrls";
import { toast } from "sonner";

export function useCreateContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, contributionData }) => {
      let contribution = null;
      let uploadedAttachments = [];

      try {
        const { data, error: contributionError } = await supabase.rpc(
          "create_contribution",
          {
            p_post_id: postId,
            p_title: contributionData.title ?? null,
            p_content: contributionData.content ?? null,
            p_content_json: contributionData.content_json ?? null,
            p_content_format: contributionData.content_format ?? "text",
            p_contribution_type:
              contributionData.contribution_type ?? "comment",
            p_status: contributionData.status ?? null,
            p_metadata: contributionData.metadata ?? {},
            p_start_at: contributionData.start_at ?? null,
            p_end_at: contributionData.end_at ?? null,
            p_lat: contributionData.lat ?? null,
            p_lng: contributionData.lng ?? null,
            p_address: contributionData.address ?? null,
          },
        );

        if (contributionError) {
          throw contributionError;
        }

        contribution = data;

        if (!contribution?.id) {
          throw new Error("Contribution was not created");
        }

        if (contributionData.attachments?.length) {
          uploadedAttachments = await uploadPostAttachments(
            postId,
            contributionData.attachments,
          );

          uploadedAttachments = uploadedAttachments.map((attachment) => {
            const original = contributionData.attachments.find(
              (a) => a.attachmentId === attachment.attachmentId,
            );

            return {
              ...attachment,
              credit_name: original?.credit_name ?? null,
              credit_url: original?.credit_url ?? null,
            };
          });
        }

        const resolvedContentJson = resolveEditorImageUrls(
          contributionData.content_json,
          uploadedAttachments,
        );

        if (resolvedContentJson) {
          const { data: updatedContribution, error: updateError } =
            await supabase.rpc("update_contribution", {
              p_contribution_id: contribution.id,
              p_title: contributionData.title ?? null,
              p_content: contributionData.content ?? null,
              p_content_json: resolvedContentJson,
              p_content_format: contributionData.content_format ?? "text",
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

          if (updateError) {
            throw updateError;
          }

          contribution = updatedContribution ?? contribution;
        }

        if (uploadedAttachments.length) {
          const { error: attachmentError } = await supabase.rpc(
            "upsert_contribution_attachments",
            {
              p_contribution_id: contribution.id,
              p_attachments: uploadedAttachments,
            },
          );

          if (attachmentError) {
            throw attachmentError;
          }
        }

        if (contributionData.links?.length) {
          const { error: linkError } = await supabase.rpc(
            "upsert_contribution_links",
            {
              p_contribution_id: contribution.id,
              p_links: contributionData.links,
            },
          );

          if (linkError) {
            throw linkError;
          }
        }

        return contribution;
      } catch (error) {
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

      toast.success("Contribution published successfully");
    },

    onError: (error) => {
      console.error("Failed to create contribution", error);
      toast.error(error?.message || "Failed to publish contribution");
    },
  });

  return {
    createContribution: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
