"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  uploadPostAttachments,
  deletePostAttachments,
} from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useCreateContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, contributionData }) => {
      let uploadedAttachments = [];

      try {
        if (contributionData.attachments?.length) {
          uploadedAttachments = await uploadPostAttachments(
            postId,
            contributionData.attachments,
          );
        }

        const { data, error } = await supabase.rpc("publish_contribution", {
          p_post_id: postId,

          p_title: contributionData.title,

          p_content: contributionData.content,

          p_metadata: contributionData.metadata ?? {},

          p_start_at: contributionData.start_at ?? null,

          p_end_at: contributionData.end_at ?? null,

          p_lat: contributionData.lat ?? null,

          p_lng: contributionData.lng ?? null,

          p_address: contributionData.address ?? null,

          p_links: contributionData.links ?? null,

          p_guest_name: contributionData.guest_name ?? null,

          p_contribution_type: contributionData.contribution_type ?? "comment",

          p_status: contributionData.status ?? null,

          p_attachments: uploadedAttachments,
        });

        if (error) throw error;

        return data;
      } catch (error) {
        if (uploadedAttachments.length) {
          try {
            await deletePostAttachments(
              uploadedAttachments.map((a) => a.storage_path),
            );
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

      toast.success("Contribution published successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to publish contribution");
    },
  });

  return {
    createContribution: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
