"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useCreateContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, contributionData }) => {
      let uploadedAttachments = [];

      // ==========================================
      // UPLOAD ATTACHMENTS
      // ==========================================

      if (contributionData.attachments?.length > 0) {
        uploadedAttachments = await Promise.all(
          contributionData.attachments.map(async (file) => {
            if (file?.url) return file;

            return uploadPostAttachment(file, contributionData.author_id);
          }),
        );
      }

      // ==========================================
      // CREATE CONTRIBUTION
      // ==========================================

      const { data, error } = await supabase.rpc("create_post_contribution", {
        p_post_id: postId,

        p_title: contributionData.title,

        p_content: contributionData.content,

        p_attachments: uploadedAttachments,

        p_metadata: contributionData.metadata,

        p_start_at: contributionData.start_at,

        p_end_at: contributionData.end_at,

        p_lat: contributionData.lat,

        p_lng: contributionData.lng,

        p_address: contributionData.address,

        p_meeting_link: contributionData.meeting_link,
      });

      if (error) throw error;

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post-contribution"],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      toast.success("Contribution created successfully");
    },

    onError: (error) => {
      console.error(error);

      toast.error(error.message || "Failed to create contribution");
    },
  });

  return {
    createContribution: mutation.mutateAsync,

    isCreating: mutation.isPending,
  };
}
