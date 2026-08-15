"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

import {
  uploadPostAttachments,
  deletePostAttachments,
} from "@/lib/supabase/storage";

import { resolveEditorImageUrls } from "@/components/editor/resolveEditorImageUrls";

import { toast } from "sonner";

export function useCreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData) => {
      let post = null;
      let uploadedAttachments = [];

      try {
        // ==========================================================
        // Step 1 - Create Post
        //
        // We need the post ID before uploading files because
        // Supabase Storage uses:
        //
        // postId/filename
        // ==========================================================

        toast.loading("Creating post...", {
          id: "create-post",
        });

        const { data, error } = await supabase.rpc("create_post", {
          p_type: postData.type,

          p_space_id:
            postData.spaces?.length > 0 ? postData.spaces[0].id : null,

          p_title: postData.title,

          p_content: postData.content,

          p_content_json: postData.content_json ?? null,

          p_content_format: postData.content_format ?? "text",

          p_metadata: postData.metadata ?? {},

          p_start_at: postData.start_at ?? null,

          p_end_at: postData.end_at ?? null,

          p_lat: postData.lat ?? null,

          p_lng: postData.lng ?? null,

          p_address: postData.address ?? null,

          p_governance_ids: postData.governance?.map((g) => g.id) ?? [],
        });

        if (error) {
          throw error;
        }

        post = data;

        // ==========================================================
        // Step 2 - Upload Attachments
        // ==========================================================

        if (postData.attachments?.length) {
          toast.loading("Uploading attachments...", {
            id: "create-post",
          });

          uploadedAttachments = await uploadPostAttachments(
            post.id,
            postData.attachments,
          );

          /*
           * Preserve credit information from the editor.
           */
          uploadedAttachments = uploadedAttachments.map((attachment) => {
            const original = postData.attachments.find(
              (a) => a.attachmentId === attachment.attachmentId,
            );

            return {
              ...attachment,

              credit_name: original?.credit_name ?? null,

              credit_url: original?.credit_url ?? null,
            };
          });
        }

        // ==========================================================
        // Step 3 - Resolve Editor.js Images
        // ==========================================================

        /*
         * At this point:
         *
         * Editor.js:
         *
         * blob:http://
         *
         * becomes:
         *
         * https://...supabase.co/storage/...
         */

        const resolvedContentJson = resolveEditorImageUrls(
          postData.content_json,
          uploadedAttachments,
        );

        // ==========================================================
        // Step 4 - Save resolved content_json
        // ==========================================================

        /*
         * If there are Editor.js images, content_json has now
         * changed from blob URLs to permanent Supabase URLs.
         *
         * We only need to call update_post if content_json
         * actually exists.
         */

        if (resolvedContentJson) {
          toast.loading("Finalizing post...", {
            id: "create-post",
          });

          const { data: updatedPost, error: updateError } = await supabase.rpc(
            "update_post",
            {
              p_post_id: post.id,

              p_type: postData.type,

              p_space_id:
                postData.spaces?.length > 0 ? postData.spaces[0].id : null,

              p_title: postData.title,

              p_content: postData.content,

              p_content_json: resolvedContentJson,

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

          post = updatedPost ?? post;
        }

        // ==========================================================
        // Step 5 - Save Attachment Records
        // ==========================================================

        if (uploadedAttachments.length) {
          toast.loading("Saving attachments...", {
            id: "create-post",
          });

          const { error: attachmentError } = await supabase.rpc(
            "upsert_post_attachments",
            {
              p_post_id: post.id,

              p_attachments: uploadedAttachments,
            },
          );

          if (attachmentError) {
            throw attachmentError;
          }
        }

        // ==========================================================
        // Step 6 - Save Links
        // ==========================================================

        if (postData.links?.length) {
          toast.loading("Saving links...", {
            id: "create-post",
          });

          const { error: linkError } = await supabase.rpc("upsert_post_links", {
            p_post_id: post.id,

            p_links: postData.links,
          });

          if (linkError) {
            throw linkError;
          }
        }

        // ==========================================================
        // Done
        // ==========================================================

        toast.success("Post published", {
          id: "create-post",
        });

        return post;
      } catch (error) {
        // ==========================================================
        // Roll back uploaded Storage files
        // ==========================================================

        if (uploadedAttachments.length) {
          try {
            await deletePostAttachments(
              uploadedAttachments
                .map((attachment) => attachment.storage_path)
                .filter(Boolean),
            );
          } catch (rollbackError) {
            console.error("Attachment rollback failed:", rollbackError);
          }
        }

        toast.dismiss("create-post");

        throw error;
      }
    },

    // ============================================================
    // Success
    // ============================================================

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      toast.success("Post created successfully");
    },

    // ============================================================
    // Error
    // ============================================================

    onError: (error) => {
      console.error(error);

      toast.error(error.message ?? "Failed to create post", {
        id: "create-post",
      });
    },
  });

  return {
    createPost: mutation.mutateAsync,

    isCreating: mutation.isPending,
  };
}
