"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, postData }) => {
      /* -------------------------
         1️⃣ Upload Attachments
      ------------------------- */
      let uploadedAttachments = [];

      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map(async (file) => {
          if (file?.url) return file;
          return await uploadPostAttachment(file, postData.author_id);
        });

        uploadedAttachments = await Promise.all(uploadPromises);
      }

      /* -------------------------
         2️⃣ Update Feed
      ------------------------- */
      const { error } = await supabase
        .from("feed")
        .update({
          type: postData.type,
          details: postData.details,
          summary: postData.summary,
          attachments: uploadedAttachments,
          metadata: postData.metadata || null,

          // 🔥 allow update (optional)
          club_id: postData.club_id,
          space_id: postData.space_id,
          scope_type: postData.scope_type,
          scope_code: postData.scope_code,
        })
        .eq("id", postId);

      if (error) throw error;

      /* -------------------------
         3️⃣ Replace Authorities
      ------------------------- */
      try {
        if (postData.governance_entities) {
          // delete old
          const { error: deleteError } = await supabase
            .from("feed_governance_entities")
            .delete()
            .eq("feed_id", postId);

          if (deleteError) throw deleteError;

          // clean + dedup
          const validEntities = postData.governance_entities.filter(
            (a) => a?.id
          );

          const uniqueMap = new Map();
          validEntities.forEach((a) => {
            uniqueMap.set(a.id, a);
          });

          const uniqueEntities = Array.from(uniqueMap.values());

          // insert new
          if (uniqueEntities.length > 0) {
            const { error: tagError } = await supabase
              .from("feed_governance_entities")
              .upsert(
                uniqueEntities.map((a) => ({
                  feed_id: postId,
                  governance_entity_id: a.id,
                })),
                {
                  onConflict: "feed_id,governance_entity_id",
                  ignoreDuplicates: true,
                }
              );

            if (tagError) throw tagError;
          }
        }
      } catch (err) {
        throw err;
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