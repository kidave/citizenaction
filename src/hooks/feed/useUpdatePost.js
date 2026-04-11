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

      /* 🔥 UPDATE TAGGED AUTHORITIES */
      if (postData.governance_entities) {
        // 1. delete old tags
        await supabase
          .from("feed_governance_entities")
          .delete()
          .eq("feed_id", postId);

        // 2. deduplicate
        const uniqueMap = new Map();
        postData.governance_entities.forEach((a) => {
          uniqueMap.set(a.id, a);
        });

        const uniqueEntities = Array.from(uniqueMap.values());

        // 3. insert new
        if (uniqueEntities.length > 0) {
          const { error: tagError } = await supabase
            .from("feed_governance_entities")
            .insert(
              uniqueEntities.map((a) => ({
                feed_id: postId,
                governance_entity_id: a.id,
              }))
            );

          if (tagError) throw tagError;
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