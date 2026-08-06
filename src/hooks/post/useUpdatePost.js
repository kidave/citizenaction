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

        const { data: postInfo, error: postInfoError } = await supabase
          .from("post")
          .select("id, author_id, space_id")
          .eq("id", postId)
          .single();

        if (postInfo?.space_id) {
          const { data: membership } = await supabase
            .from("space_member")
            .select("*")
            .eq("space_id", postInfo.space_id)
            .eq("user_id", user?.id);
        }

        // ==========================================================
        // Upload new attachments
        // ==========================================================

        if (postData.attachments?.length) {
          const existingAttachments = postData.attachments
            .filter((attachment) => attachment.storage_path || attachment.path)
            .map((attachment) => ({
              storage_path: attachment.storage_path ?? attachment.path,
              public_url: attachment.public_url ?? attachment.url,
              file_name: attachment.file_name ?? attachment.name,
              mime_type: attachment.mime_type ?? attachment.type,
              file_size: attachment.file_size ?? attachment.size,
              width: attachment.width,
              height: attachment.height,
              duration: attachment.duration,
              sort_order: attachment.sort_order ?? 0,
              credit_name: attachment.credit_name ?? null,
              credit_url: attachment.credit_url ?? null,
            }));

          const newAttachments = postData.attachments.filter(
            (attachment) => !(attachment.storage_path || attachment.path),
          );

          const uploadedNewAttachments = newAttachments.length
            ? await uploadPostAttachments(postId, newAttachments)
            : [];

          const mergedUploads = uploadedNewAttachments.map((uploaded) => {
            const original = newAttachments.find(
              (a) => a.file.name === uploaded.file_name,
            );

            return {
              ...uploaded,
              credit_name: original?.credit_name ?? null,
              credit_url: original?.credit_url ?? null,
            };
          });

          uploadedAttachments = [...existingAttachments, ...mergedUploads];
        }

        // ==========================================================
        // Update post
        // ==========================================================

        const { data, error } = await supabase.rpc(
          "update_post_with_attachments",
          {
            p_post_id: postId,
            p_type: postData.type,
            p_title: postData.title,
            p_details: postData.content,
            p_start_at: postData.start_at ?? null,
            p_end_at: postData.end_at ?? null,
            p_lat: postData.lat ?? null,
            p_lng: postData.lng ?? null,
            p_address: postData.address ?? null,
            p_links: postData.links ?? null,
            p_metadata: postData.metadata ?? {},
            p_is_global: !postData.spaces || postData.spaces.length === 0,
            p_space_id:
              postData.spaces?.length > 0 ? postData.spaces[0].id : null,
            p_governance_ids: postData.governance?.map((g) => g.id) ?? [],
            p_attachments: uploadedAttachments,
          },
        );

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
          } catch (rollbackError) {}
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
      toast.error(error.message || "Failed to update post");
    },
  });

  return {
    updatePost: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
