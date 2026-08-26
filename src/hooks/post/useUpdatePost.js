"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachments, deletePostAttachments } from "@/lib/supabase/storage";
import { resolveEditorImageUrls } from "@/components/editor/resolveEditorImageUrls";
import { toast } from "sonner";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, postData }) => {
      let newUploadedAttachments = [];

      try {
        const { data: existingAttachments, error: existingAttachmentsError } = await supabase
          .from("attachment")
          .select(`
            id, storage_path, thumbnail_path, public_url, file_name, mime_type,
            file_size, width, height, duration, sort_order, credit_name, credit_url
          `)
          .eq("post_id", postId)
          .is("contribution_id", null);

        if (existingAttachmentsError) throw existingAttachmentsError;

        const editorAttachments = Array.isArray(postData.attachments) ? postData.attachments : [];
        const editorStoragePaths = new Set(
          editorAttachments.map((attachment) => attachment?.storage_path).filter(Boolean),
        );

        const retainedAttachments = existingAttachments
          .filter((attachment) => editorStoragePaths.has(attachment.storage_path))
          .map((attachment) => {
            const editorAttachment = editorAttachments.find(
              (item) => item?.storage_path === attachment.storage_path,
            );

            return {
              storage_path: attachment.storage_path,
              thumbnail_path: attachment.thumbnail_path ?? null,
              thumbnail_url: attachment.thumbnail_url ?? null,
              public_url: attachment.public_url,
              file_name: attachment.file_name,
              mime_type: attachment.mime_type,
              file_size: attachment.file_size,
              width: attachment.width,
              height: attachment.height,
              duration: attachment.duration,
              sort_order: attachment.sort_order ?? 0,
              credit_name: editorAttachment?.credit_name ?? attachment.credit_name ?? null,
              credit_url: editorAttachment?.credit_url ?? attachment.credit_url ?? null,
            };
          });

        const newFiles = editorAttachments.filter(
          (attachment) => !attachment?.storage_path && attachment?.file,
        );

        if (newFiles.length) {
          toast.loading("Uploading attachments...", { id: "update-post" });

          const uploaded = await uploadPostAttachments(postId, newFiles);
          newUploadedAttachments = uploaded.map((uploadedAttachment, index) => ({
            ...uploadedAttachment,
            credit_name: newFiles[index]?.credit_name ?? null,
            credit_url: newFiles[index]?.credit_url ?? null,
          }));
        }

        const finalAttachments = [...retainedAttachments, ...newUploadedAttachments].map(
          (attachment, index) => ({ ...attachment, sort_order: index }),
        );

        const resolvedContentJson = resolveEditorImageUrls(
          postData.content_json,
          newUploadedAttachments,
        );

        toast.loading("Updating post...", { id: "update-post" });

        const { data: updatedPost, error: updateError } = await supabase.rpc("update_post", {
          p_post_id: postId,
          p_type: postData.type,
          p_space_ids: postData.spaces?.map((space) => space.id) ?? [],
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
        });

        if (updateError) throw updateError;

        const { error: attachmentError } = await supabase.rpc("upsert_post_attachments", {
          p_post_id: postId,
          p_attachments: finalAttachments,
        });
        if (attachmentError) throw attachmentError;

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
        if (linkError) throw linkError;

        const finalStoragePaths = new Set(
          finalAttachments.map((attachment) => attachment.storage_path).filter(Boolean),
        );
        const removedAttachments = existingAttachments.filter(
          (attachment) => attachment.storage_path && !finalStoragePaths.has(attachment.storage_path),
        );

        if (removedAttachments.length) {
          await deletePostAttachments(removedAttachments);
        }

        return updatedPost;
      } catch (error) {
        if (newUploadedAttachments.length) {
          try {
            await deletePostAttachments(newUploadedAttachments);
          } catch (rollbackError) {
            console.error("Attachment rollback failed:", rollbackError);
          }
        }
        throw error;
      }
    },

    onSuccess: (updatedPost, variables) => {
      const postId = variables.postId;
      queryClient.setQueryData(["post", postId], (currentPost) =>
        currentPost ? { ...currentPost, ...updatedPost } : updatedPost,
      );
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post updated successfully", { id: "update-post" });
    },

    onError: (error) => {
      console.error("Update post error:", error);
      toast.error(error.message || "Failed to update post", { id: "update-post" });
    },
  });

  return {
    updatePost: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
