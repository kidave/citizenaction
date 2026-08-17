"use client";

import { toast } from "sonner";

import { useEditor } from "./useEditor";

import { useCreateContribution } from "@/hooks/contribution/useCreateContribution";
import { useUpdateContribution } from "@/hooks/contribution/useUpdateContribution";
import { useDeleteContribution } from "@/hooks/contribution/useDeleteContribution";

export function useContributionEditor(contribution = null, post = null) {
  const editor = useEditor(contribution);

  const { createContribution } = useCreateContribution();

  const { updateContribution } = useUpdateContribution();

  const { deleteContribution } = useDeleteContribution();

  async function submit(onSuccess) {
    if (!editor.content.trim()) {
      toast.error("Enter content.");
      return;
    }

    if (!post?.id) {
      toast.error("Post ID is missing.");
      return;
    }

    const data = editor.getEditorData();

    const payload = {
      title: data.title ?? null,

      content: data.content ?? null,

      contribution_type: contribution?.contribution_type ?? "comment",

      status: contribution?.status ?? null,

      attachments: data.attachments ?? [],

      links: data.links ?? [],

      start_at: data.start_at ?? null,

      end_at: data.end_at ?? null,

      lat: data.lat ?? null,

      lng: data.lng ?? null,

      address: data.address ?? null,

      metadata: data.metadata ?? {},
    };

    try {
      if (contribution) {
        await updateContribution({
          contributionId: contribution.id,

          postId: post.id,

          contributionData: payload,
        });
      } else {
        await createContribution({
          postId: post.id,

          contributionData: payload,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save contribution", {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      toast.error(error?.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!contribution?.id) {
      return;
    }

    try {
      await deleteContribution(contribution);

      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete contribution", {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      toast.error(error?.message || "Failed to delete contribution");
    }
  }

  return {
    ...editor,

    submit,

    remove,
  };
}
