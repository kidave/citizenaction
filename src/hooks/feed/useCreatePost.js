"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useCreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData) => {

      /* 1️⃣ Upload Attachments */
      let uploadedAttachments = [];

      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map((file) =>
          uploadPostAttachment(file, postData.author_id)
        );

        uploadedAttachments = await Promise.all(uploadPromises);
      }

      /* 2️⃣ Insert Feed Row */
      const { data: feedRow, error } = await supabase
        .from("feed")
        .insert({
          author_id: postData.author_id,
          scope_type: postData.scope_type,
          scope_code: postData.scope_code,
          type: postData.type,
          summary: postData.summary,
          details: postData.details,
          attachments: uploadedAttachments,
          metadata: postData.metadata || null,
        })
        .select()
        .single();

      if (error) throw error;

      /* 🔥 3️⃣ REPLACE AUTHORITIES (SIMPLIFIED) */
      if (postData.governance_entities) {

        // remove my existing (safe even for new post)
        await supabase
          .from("action_escalate")
          .delete()
          .eq("action_id", feedRow.id)
          .eq("escalated_by", postData.author_id);

        // insert new
        if (postData.governance_entities.length > 0) {
          const { error: escalateError } = await supabase
            .from("action_escalate")
            .insert(
              postData.governance_entities.map((a) => ({
                action_id: feedRow.id,
                governance_entity_id: a.id,
                escalated_by: postData.author_id,
              }))
            );

          if (escalateError) throw escalateError;
        }
      }

      return feedRow;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post published successfully");
    },

    onError: (error) => {
      console.error("Create post error:", error);
      toast.error(error.message || "Failed to create post");
    },
  });

  return {
    createPost: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}