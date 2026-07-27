"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  uploadPostAttachments,
  deletePostAttachments,
} from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, postData }) => {
      let uploadedAttachments = [];

      try {
        // ==========================================================
        // Debug
        // ==========================================================

        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("================================");
        console.log("UPDATE POST DEBUG");
        console.log("Current User:", user?.id);
        console.log("Post ID:", postId);

        const { data: postInfo, error: postInfoError } = await supabase
          .from("post")
          .select("id, author_id, space_id")
          .eq("id", postId)
          .single();

        console.log("Post Info:", postInfo);
        console.log("Post Info Error:", postInfoError);

        if (postInfo?.space_id) {
          const { data: membership } = await supabase
            .from("space_member")
            .select("*")
            .eq("space_id", postInfo.space_id)
            .eq("user_id", user?.id);

          console.log("Space Membership:", membership);
        }

        console.log("================================");

        // ==========================================================
        // Upload new attachments
        // ==========================================================

        if (postData.attachments?.length) {
          const existingAttachments = postData.attachments.filter(
            (attachment) => attachment.storage_path,
          );

          const newAttachments = postData.attachments.filter(
            (attachment) => !attachment.storage_path,
          );

          const uploadedNewAttachments = newAttachments.length
            ? await uploadPostAttachments(postId, newAttachments)
            : [];

          uploadedAttachments = [
            ...existingAttachments,
            ...uploadedNewAttachments,
          ];
        }

        // ==========================================================
        // Update post
        // ==========================================================

        const { data, error } = await supabase.rpc(
          "update_post_with_attachments",
          {
            p_post_id: postId,
            p_type: postData.type,
            p_summary: postData.summary,
            p_details: postData.details,
            p_start_at: postData.start_at ?? null,
            p_end_at: postData.end_at ?? null,
            p_lat: postData.lat ?? null,
            p_lng: postData.lng ?? null,
            p_address: postData.address ?? null,
            p_meeting_link: postData.meeting_link ?? null,
            p_metadata: postData.metadata ?? {},
            p_is_global: !postData.spaces || postData.spaces.length === 0,
            p_space_id:
              postData.spaces?.length > 0 ? postData.spaces[0].id : null,
            p_governance_ids: postData.governance?.map((g) => g.id) ?? [],
            p_attachments: uploadedAttachments,
          },
        );

        console.log("RPC Response:", { data, error });

        if (error) throw error;

        return data;
      } catch (error) {
        // ==========================================================
        // Rollback uploaded files
        // ==========================================================

        const newUploads = uploadedAttachments.filter((attachment) =>
          postData.attachments?.find(
            (a) => !a.storage_path && a.file?.name === attachment.file_name,
          ),
        );

        if (newUploads.length) {
          try {
            await deletePostAttachments(
              newUploads.map((attachment) => attachment.storage_path),
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

      toast.success("Post updated successfully");
    },

    onError: (error) => {
      console.error("Update Post Error:", error);
      toast.error(error.message || "Failed to update post");
    },
  });

  return {
    updatePost: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
