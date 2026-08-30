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
        toast.loading("Creating post...", { id: "create-post" });

        const { data, error } = await supabase.rpc("create_post", {
          p_type: postData.type,
          p_space_ids: postData.spaces?.map((space) => space.id) ?? [],
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

        if (error) throw error;

        post = data;

        if (postData.attachments?.length) {
          toast.loading("Uploading attachments...", {
            id: "create-post",
          });

          const uploaded = await uploadPostAttachments(
            post.id,
            postData.attachments,
          );

          uploadedAttachments = uploaded.map((attachment, index) => {
            const original = postData.attachments[index];

            return {
              ...attachment,
              credit_name: original?.credit_name ?? null,
              credit_url: original?.credit_url ?? null,
            };
          });
        }

        const resolvedContentJson = resolveEditorImageUrls(
          postData.content_json,
          uploadedAttachments,
        );

        if (resolvedContentJson) {
          toast.loading("Finalizing post...", {
            id: "create-post",
          });

          const { data: updatedPost, error: updateError } = await supabase.rpc(
            "update_post",
            {
              p_post_id: post.id,
              p_type: postData.type,
              p_space_ids: postData.spaces?.map((space) => space.id) ?? [],
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

          if (updateError) throw updateError;

          post = updatedPost ?? post;
        }

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

          if (attachmentError) throw attachmentError;
        }

        if (postData.links?.length) {
          toast.loading("Saving links...", {
            id: "create-post",
          });

          const { error: linkError } = await supabase.rpc("upsert_post_links", {
            p_post_id: post.id,
            p_links: postData.links,
          });

          if (linkError) throw linkError;
        }

        toast.success("Post published", {
          id: "create-post",
        });

        return post;
      } catch (error) {
        if (uploadedAttachments.length) {
          try {
            await deletePostAttachments(uploadedAttachments);
          } catch (rollbackError) {
            console.error("Attachment rollback failed:", rollbackError);
          }
        }

        toast.dismiss("create-post");

        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },

    onError: (error) => {
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
