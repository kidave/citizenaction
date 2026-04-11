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

      /* 🔥 INSERT TAGGED AUTHORITIES (CORRECT TABLE) */
      if (postData.governance_entities?.length > 0) {
        const uniqueMap = new Map();
        postData.governance_entities.forEach((a) => {
          uniqueMap.set(a.id, a);
        });

        const uniqueEntities = Array.from(uniqueMap.values());

        const { error: tagError } = await supabase
          .from("feed_governance_entities")
          .insert(
            uniqueEntities.map((a) => ({
              feed_id: feedRow.id,
              governance_entity_id: a.id,
            }))
          );

        if (tagError) throw tagError;
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