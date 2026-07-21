"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdateContribution() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ contributionId, contributionData }) => {
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
      // UPDATE CONTRIBUTION
      // ==========================================

      const { data, error } = await supabase.rpc("update_post_contribution", {
        p_id: contributionId,

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

      toast.success("Contribution updated successfully");
    },

    onError: (error) => {
      console.error(error);

      toast.error(error.message || "Failed to update contribution");
    },
  });

  return {
    updateContribution: mutation.mutateAsync,

    isUpdating: mutation.isPending,
  };
}
