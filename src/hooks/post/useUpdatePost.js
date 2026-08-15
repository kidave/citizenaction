"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

import {
  uploadPostAttachments,
  deletePostAttachments,
} from "@/lib/supabase/storage";

import { resolveEditorImageUrls } from "@/components/editor/resolveEditorImageUrls";

import { toast } from "sonner";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, postData }) => {
      let newUploadedAttachments = [];

      try {
        // ==========================================================
        // 1. Get current attachment records
        // ==========================================================

        const { data: existingAttachments, error: existingAttachmentsError } =
          await supabase
            .from("attachment")
            .select(
              `
              id,
              storage_path,
              public_url,
              file_name,
              mime_type,
              file_size,
              width,
              height,
              duration,
              sort_order,
              credit_name,
              credit_url
            `,
            )
            .eq("post_id", postId)
            .is("contribution_id", null);

        if (existingAttachmentsError) {
          throw existingAttachmentsError;
        }

        // ==========================================================
        // 2. Read attachments from editor
        // ==========================================================

        const editorAttachments = Array.isArray(postData.attachments)
          ? postData.attachments
          : [];

        // ==========================================================
        // 3. Find retained existing attachments
        // ==========================================================

        const editorStoragePaths = new Set(
          editorAttachments
            .map((attachment) => attachment?.storage_path)
            .filter(Boolean),
        );

        const retainedAttachments = existingAttachments
          .filter((attachment) =>
            editorStoragePaths.has(attachment.storage_path),
          )
          .map((attachment) => ({
            storage_path: attachment.storage_path,

            public_url: attachment.public_url,

            file_name: attachment.file_name,

            mime_type: attachment.mime_type,

            file_size: attachment.file_size,

            width: attachment.width,

            height: attachment.height,

            duration: attachment.duration,

            sort_order: attachment.sort_order ?? 0,

            credit_name: attachment.credit_name ?? null,

            credit_url: attachment.credit_url ?? null,
          }));

        // ==========================================================
        // 4. Find genuinely new files
        // ==========================================================

        const newFiles = editorAttachments.filter(
          (attachment) => !attachment?.storage_path && attachment?.file,
        );

        // ==========================================================
        // 5. Upload new files
        // ==========================================================

        if (newFiles.length) {
          toast.loading("Uploading attachments...", {
            id: "update-post",
          });

          const uploaded = await uploadPostAttachments(postId, newFiles);

          newUploadedAttachments = uploaded.map((uploadedAttachment, index) => {
            const original = newFiles[index];

            return {
              ...uploadedAttachment,

              credit_name: original?.credit_name ?? null,

              credit_url: original?.credit_url ?? null,
            };
          });
        }

        // ==========================================================
        // 6. Build final attachment list
        // ==========================================================

        const finalAttachments = [
          ...retainedAttachments,
          ...newUploadedAttachments,
        ].map((attachment, index) => ({
          ...attachment,

          sort_order: index,
        }));

        // ==========================================================
        // 7. Resolve Editor.js image URLs
        // ==========================================================

        /*
         * This is the important part.
         *
         * New Editor.js images contain:
         *
         * blob:http://localhost...
         *
         * plus:
         *
         * attachmentId
         *
         * newUploadedAttachments now contains:
         *
         * attachmentId
         * public_url
         *
         * so the helper replaces the blob URL
         * with the permanent Supabase URL.
         */

        const resolvedContentJson = resolveEditorImageUrls(
          postData.content_json,
          newUploadedAttachments,
        );

        // ==========================================================
        // 8. Update post
        // ==========================================================

        toast.loading("Updating post...", {
          id: "update-post",
        });

        const { data: updatedPost, error: updateError } = await supabase.rpc(
          "update_post",
          {
            p_post_id: postId,

            p_type: postData.type,

            p_space_id:
              postData.spaces?.length > 0 ? postData.spaces[0].id : null,

            p_title: postData.title,

            p_content: postData.content,

            p_content_json: resolvedContentJson ?? null,

            p_content_format: postData.content_format ?? "text",

            p_metadata: postData.metadata ?? {},

            p_start_at: postData.start_at ?? null,

            p_end_at: postData.end_at ?? null,

            p_lat: postData.lat ?? null,

            p_lng: postData.lng ?? null,

            p_address: postData.address ?? null,

            p_governance_ids: postData.governance?.map((g) => g.id) ?? [],
          },
        );

        if (updateError) {
          throw updateError;
        }

        // ==========================================================
        // 9. Replace attachment records
        // ==========================================================

        const { error: attachmentError } = await supabase.rpc(
          "upsert_post_attachments",
          {
            p_post_id: postId,

            p_attachments: finalAttachments,
          },
        );

        if (attachmentError) {
          throw attachmentError;
        }

        // ==========================================================
        // 10. Replace links
        // ==========================================================

        const links = Array.isArray(postData.links)
          ? postData.links.map((link, index) => ({
              url: link.url,

              type: link.type ?? "website",

              title: link.title ?? null,

              description: link.description ?? null,

              hostname: link.hostname ?? null,

              image_url: link.image_url ?? null,

              icon_url: link.icon_url ?? null,

              sort_order: index,
            }))
          : [];

        const { error: linkError } = await supabase.rpc("upsert_post_links", {
          p_post_id: postId,

          p_links: links,
        });

        if (linkError) {
          throw linkError;
        }

        // ==========================================================
        // 11. Delete removed Storage files
        // ==========================================================

        const oldStoragePaths = existingAttachments
          .map((attachment) => attachment.storage_path)
          .filter(Boolean);

        const finalStoragePaths = new Set(
          finalAttachments
            .map((attachment) => attachment.storage_path)
            .filter(Boolean),
        );

        const removedStoragePaths = oldStoragePaths.filter(
          (path) => !finalStoragePaths.has(path),
        );

        if (removedStoragePaths.length) {
          await deletePostAttachments(removedStoragePaths);
        }

        // ==========================================================
        // 12. Return updated post
        // ==========================================================

        return updatedPost;
      } catch (error) {
        // ==========================================================
        // Roll back ONLY newly uploaded files
        // ==========================================================

        if (newUploadedAttachments.length) {
          try {
            await deletePostAttachments(
              newUploadedAttachments
                .map((attachment) => attachment.storage_path)
                .filter(Boolean),
            );
          } catch (rollbackError) {
            console.error("Attachment rollback failed:", rollbackError);
          }
        }

        throw error;
      }
    },

    // ============================================================
    // Success
    // ============================================================

    onSuccess: (updatedPost, variables) => {
      const postId = variables.postId;

      queryClient.setQueryData(["post", postId], (currentPost) => {
        if (!currentPost) {
          return updatedPost;
        }

        return {
          ...currentPost,
          ...updatedPost,
        };
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      toast.success("Post updated successfully", {
        id: "update-post",
      });
    },

    // ============================================================
    // Error
    // ============================================================

    onError: (error) => {
      console.error("Update post error:", error);

      toast.error(error.message || "Failed to update post", {
        id: "update-post",
      });
    },
  });

  return {
    updatePost: mutation.mutateAsync,

    isUpdating: mutation.isPending,
  };
}
