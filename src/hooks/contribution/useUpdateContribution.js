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
        if (contributionData.attachments?.length) {
          const existing = contributionData.attachments.filter(
            (a) => a.storage_path,
          );

          const fresh = contributionData.attachments.filter(
            (a) => !a.storage_path,
          );

          const uploaded = fresh.length
            ? await uploadPostAttachments(postId, fresh)
            : [];

          uploadedAttachments = [...existing, ...uploaded];
        }

        const { data, error } = await supabase.rpc("update_contribution", {
          p_contribution_id: contributionId,

          p_title: contributionData.title,

          p_content: contributionData.content,

          p_metadata: contributionData.metadata ?? {},

          p_start_at: contributionData.start_at ?? null,

          p_end_at: contributionData.end_at ?? null,

          p_lat: contributionData.lat ?? null,

          p_lng: contributionData.lng ?? null,

          p_address: contributionData.address ?? null,

          p_links: contributionData.links ?? null,

          p_status: contributionData.status ?? null,

          p_attachments: uploadedAttachments,
        });

        if (error) throw error;

        return data;
      } catch (error) {
        const newUploads = uploadedAttachments.filter((attachment) =>
          contributionData.attachments?.find(
            (a) => !a.storage_path && a.file?.name === attachment.file_name,
          ),
        );

        if (newUploads.length) {
          try {
            await deletePostAttachments(newUploads.map((a) => a.storage_path));
          } catch (rollbackError) {
            console.error("Attachment rollback failed", rollbackError);
          }
        }

        throw error;
      }
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["post-contributions", variables.postId],
      });

      toast.success("Contribution updated successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to update contribution");
    },
  });

  return {
    updateContribution: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
