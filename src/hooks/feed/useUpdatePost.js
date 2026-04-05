"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, postData }) => {

      let uploadedAttachments = [];

      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map(async (file) => {
          if (file?.url) return file;
          return await uploadPostAttachment(file, postData.author_id);
        });

        uploadedAttachments = await Promise.all(uploadPromises);
      }

      const { error } = await supabase
        .from("feed")
        .update({
          type: postData.type,
          details: postData.details,
          summary: postData.summary,
          attachments: uploadedAttachments,
          metadata: postData.metadata || null,
        })
        .eq("id", postId);

      /* 🔥 REPLACE AUTHORITIES (SIMPLIFIED) */
      if (postData.governance_entities) {

        // delete ONLY my tags
        await supabase
          .from("action_escalate")
          .delete()
          .eq("action_id", postId)
          .eq("escalated_by", postData.author_id);

        // insert new
        if (postData.governance_entities.length > 0) {
          const { error: escalateError } = await supabase
            .from("action_escalate")
            .insert(
              postData.governance_entities.map((a) => ({
                action_id: postId,
                governance_entity_id: a.id,
                escalated_by: postData.author_id,
              }))
            );

          if (escalateError) throw escalateError;
        }
      }

      if (error) throw error;

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post updated successfully");
    },

    onError: (error) => {
      console.error("Update post error:", error);
      toast.error(error.message || "Failed to update post");
    },
  });

  return {
    updatePost: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}