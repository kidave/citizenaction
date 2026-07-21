"use client";

import { toast } from "sonner";

import { useEditor } from "@/hooks/editor/useEditor";

import { useCreatePost } from "@/hooks/post/useCreatePost";
import { useUpdatePost } from "@/hooks/post/useUpdatePost";
import { useDeletePost } from "@/hooks/post/useDeletePost";

import { postSchema } from "@/schemas/feed/postSchema";

export function usePostEditor(post = null) {
  const editor = useEditor(post);

  const { createPost } = useCreatePost();
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();

  async function submit(onSuccess) {
    if (!editor.content.trim()) {
      toast.error("Enter content.");
      return;
    }

    const result = postSchema.safeParse({
      type: editor.type,
      start_at: editor.start_at,
      end_at: editor.end_at,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    const data = editor.getEditorData();

    const payload = {
      author_id: data.author_id,

      spaces: data.spaces,

      is_global: data.is_global,

      governance_entities: data.governance_entities,

      type: data.type,

      summary: data.title || data.content.slice(0, 200),

      details: data.content,

      attachments: data.attachments,

      start_at: data.start_at,

      end_at: data.end_at,

      lat: data.lat,

      lng: data.lng,

      address: data.address,

      meeting_link: data.meeting_link,

      metadata: data.metadata,
    };

    try {
      if (post) {
        await updatePost({
          postId: post.id,
          postData: payload,
        });
      } else {
        await createPost(payload);
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!post) return;

    try {
      await deletePost(post.id);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  return {
    ...editor,

    submit,

    remove,
  };
}
