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
      const postId = crypto.randomUUID();

      let uploadedAttachments = [];

      try {
        // ==========================================================
        // Upload attachments
        // ==========================================================

        if (postData.attachments?.length) {
          uploadedAttachments = await uploadPostAttachments(
            postId,
            postData.attachments,
          );
        }

        // ==========================================================
        // Publish post
        // ==========================================================

        const { data, error } = await supabase.rpc("publish_post", {
          p_post_id: postId,

          p_space_id:
            postData.spaces?.length > 0 ? postData.spaces[0].id : null,

          p_type: postData.type,

          p_summary: postData.summary,

          p_details: postData.details,

          p_is_global: !postData.spaces || postData.spaces.length === 0,

          p_metadata: postData.metadata ?? {},

          p_start_at: postData.start_at ?? null,

          p_end_at: postData.end_at ?? null,

          p_lat: postData.lat ?? null,

          p_lng: postData.lng ?? null,

          p_address: postData.address ?? null,

          p_meeting_link: postData.meeting_link ?? null,

          p_date: null,

          p_time: null,

          p_slug: null,

          p_governance_ids: postData.governance?.map((g) => g.id) ?? [],

          p_attachments: uploadedAttachments,
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

      toast.success("Post published successfully");
    },

    onError: (error) => {
      console.error(error);

      toast.error(error.message || "Failed to publish post");
    },
  });

  return {
    createPost: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
