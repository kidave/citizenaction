"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, postData }) => {

      /* 1️⃣ Upload Attachments */
      let uploadedAttachments = [];

      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map(async (file) => {
          if (file?.url) return file; // existing file
          return await uploadPostAttachment(file, postData.author_id);
        });

        uploadedAttachments = await Promise.all(uploadPromises);
      }

      /* 2️⃣ Update Feed Row */
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

      if (error) throw error;

      /* 3️⃣ Reset Governance Relations */
      const { error: deleteError } = await supabase
        .from("feed_governance_entities")
        .delete()
        .eq("feed_id", postId);

      if (deleteError) throw deleteError;

      /* 4️⃣ Insert Updated Relations */
      if (postData.governance_entities?.length > 0) {
        const relations = postData.governance_entities.map((entity) => ({
          feed_id: postId,
          governance_entity_id: entity.id,
        }));

        const { error: relationError } = await supabase
          .from("feed_governance_entities")
          .insert(relations);

        if (relationError) throw relationError;
      }

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