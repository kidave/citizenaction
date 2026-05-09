"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useCreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData) => {

      if (!postData.space_id && !postData.scope_code && !postData.is_global) {
        throw new Error("Select space, location or mark as global");
      }

      let uploadedAttachments = [];

      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map((file) =>
          uploadPostAttachment(file, postData.author_id)
        );

        uploadedAttachments = await Promise.all(uploadPromises);
      }

      const { data, error } = await supabase
        .from("feed")
        .insert({
          author_id: postData.author_id,
          space_id: postData.space_id || null,
          scope_type: postData.scope_type || null,
          scope_code: postData.scope_code || null,
          is_global: !!postData.is_global,
          type: postData.type,
          summary: postData.summary,
          details: postData.details,
          start_at: postData.start_at ?? null,
          end_at: postData.end_at ?? null,
          lat: postData.lat ?? null,
          lng: postData.lng ?? null,
          address: postData.address ?? null,
          meeting_link: postData.meeting_link ?? null,
          mode: postData.mode ?? "offline",

          metadata: postData.metadata || null,
          attachments: uploadedAttachments,
        })
        .select()
        .single();

      if (error) throw error;

      if (postData.governance_entities?.length > 0) {
        const rows = postData.governance_entities.map((e) => ({
          feed_id: data.id,
          governance_entity_id: e.id,
        }));

        const { error: tagError } = await supabase
          .from("feed_governance_entities")
          .insert(rows);

        if (tagError) throw tagError;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post published successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to create post");
    },
  });

  return {
    createPost: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}