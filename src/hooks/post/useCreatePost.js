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
      let post = null;
      let uploadedAttachments = [];

      // ==========================================================
      // Step 1 - Create Post
      // ==========================================================

      toast.loading("Creating post...", {
        id: "create-post",
      });

      const { data, error } = await supabase.rpc("create_post", {
        p_type: postData.type,

        p_space_id: postData.spaces?.length > 0 ? postData.spaces[0].id : null,

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
        toast.dismiss("create-post");
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

        try {
          uploadedAttachments = await uploadPostAttachments(
            post.id,
            postData.attachments,
          );

          uploadedAttachments = uploadedAttachments.map((attachment) => {
            const original = postData.attachments.find(
              (a) => a.file?.name === attachment.file_name,
            );

            return {
              ...attachment,
              credit_name: original?.credit_name ?? null,
              credit_url: original?.credit_url ?? null,
            };
          });

          const { error: attachmentError } = await supabase.rpc(
            "upsert_post_attachments",
            {
              p_post_id: post.id,
              p_attachments: uploadedAttachments,
            },
          );

          if (attachmentError) throw attachmentError;
        } catch (error) {
          await deletePostAttachments(
            uploadedAttachments.map((a) => a.storage_path),
          );

          throw error;
        }
      }

      // ==========================================================
      // Step 3 - Save Links
      // ==========================================================

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
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      toast.success("Post created successfully");
    },

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
