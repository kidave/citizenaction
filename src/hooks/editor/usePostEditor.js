"use client";

import { toast } from "sonner";
import { useEditor } from "@/hooks/editor/useEditor";
import { useCreatePost } from "@/hooks/post/useCreatePost";
import { useUpdatePost } from "@/hooks/post/useUpdatePost";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import { postSchema } from "@/schemas/feed/postSchema";

export function usePostEditor(
  item = null,
  initialSpace = null,
  options = {},
) {
  const editor = useEditor(item, initialSpace, {
    draftScope: options.draftScope || "post",
    draftContextId: options.draftContextId || initialSpace?.id || null,
  });
  const { createPost } = useCreatePost();
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();

  async function submit(onSuccess) {
    if (!editor.title.trim()) {
      toast.error("Enter a post title.");
      return;
    }

    if (!editor.content.trim()) {
      toast.error("Enter content.");
      return;
    }

    const result = postSchema.safeParse({
      start_at: editor.start_at,
      end_at: editor.end_at,
      address: editor.address,
      lat: editor.lat,
      lng: editor.lng,
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Check the post details.");
      return;
    }

    const data = editor.getEditorData();
    const payload = {
      author_id: data.author_id,
      spaces: data.spaces,
      is_global: data.is_global,
      governance: data.governance,
      title: data.title.trim(),
      content: data.content,
      content_json: data.content_json,
      content_format: data.content_format,
      attachments: data.attachments,
      start_at: data.start_at,
      end_at: data.end_at,
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      links: data.links,
      metadata: data.metadata,
    };

    try {
      const savedPost = item
        ? await updatePost({ postId: item.id, postData: payload })
        : await createPost(payload);

      if (!item) {
        editor.clearDraft();
      }

      onSuccess?.(savedPost);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to save post", {
          message: error?.message,
          code: error?.code,
          status: error?.status,
        });
      }
      toast.error(error?.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!item) return;
    try {
      await deletePost(item.id);
      onSuccess?.();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to delete post", {
          message: error?.message,
          code: error?.code,
          status: error?.status,
        });
      }
      toast.error(error?.message || "Failed to delete post");
    }
  }

  return { ...editor, submit, remove };
}
