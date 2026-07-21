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

    const data = editor.getEditorData();

    const payload = {
      author_id: data.author_id,

      title: data.title,

      content: data.content,

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
      if (contribution) {
        await updateContribution({
          contributionId: contribution.id,
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
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!contribution) return;

    try {
      await deleteContribution(contribution.id);
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
