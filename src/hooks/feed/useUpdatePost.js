"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, postData }) => {

      if (!postData.space_id && !postData.scope_code && !postData.is_global) {
        throw new Error("Invalid post context");
      }

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
          space_id: postData.space_id || null,
          scope_type: postData.scope_type || null,
          scope_code: postData.scope_code || null,
          is_global: !!postData.is_global,
        })
        .eq("id", postId);

      if (error) throw error;

      const { error: deleteError } = await supabase
        .from("feed_governance_entities")
        .delete()
        .eq("feed_id", postId);

      if (deleteError) throw deleteError;


      if (postData.governance_entities?.length > 0) {
        const rows = postData.governance_entities.map((e) => ({
          feed_id: postId,
          governance_entity_id: e.id,
        }));

        const { error: insertError } = await supabase
          .from("feed_governance_entities")
          .insert(rows);

        if (insertError) throw insertError;
      }

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post updated successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to update post");
    },
  });

  return {
    updatePost: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}