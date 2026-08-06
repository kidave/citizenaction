"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  uploadPostAttachments,
  deletePostAttachments,
} from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useCreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData) => {
      let uploadedAttachments = [];

      try {
        // ==========================================================
        // Upload attachments
        // ==========================================================

        if (postData.attachments?.length) {
          const uploaded = await uploadPostAttachments(postData.attachments);

          uploadedAttachments = uploaded.map((uploadedAttachment) => {
            const original = postData.attachments.find(
              (a) => a.file?.name === uploadedAttachment.file_name,
            );

            return {
              ...uploadedAttachment,
              credit_name: original?.credit_name ?? null,
              credit_url: original?.credit_url ?? null,
            };
          });
        }

        // ==========================================================
        // Create post
        // ==========================================================

        const { data, error } = await supabase.rpc("create_post", {
          p_type: postData.type,

          p_space_id:
            postData.spaces?.length > 0 ? postData.spaces[0].id : null,

          p_summary: postData.summary,

          p_details: postData.details,

          p_metadata: postData.metadata ?? {},

          p_start_at: postData.start_at ?? null,

          p_end_at: postData.end_at ?? null,

          p_lat: postData.lat ?? null,

          p_lng: postData.lng ?? null,

          p_address: postData.address ?? null,

          p_governance_ids: postData.governance?.map((g) => g.id) ?? [],

          p_attachments: uploadedAttachments,

          p_links: postData.links ?? [],
        });

        if (error) throw error;

        return data;
      } catch (error) {
        // ==========================================================
        // Rollback uploaded files
        // ==========================================================

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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post"],
      });

      toast.success("Post created successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to create post");
    },
  });

  return {
    createPost: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
