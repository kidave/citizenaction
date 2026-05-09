"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useDeleteMeetingItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ feed_id, user_id }) => {
      const { error } = await supabase
        .from("meeting_item")
        .delete()
        .eq("feed_id", feed_id)
        .eq("user_id", user_id);

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-meeting", feed_id] });
      toast.success("Deleted successfully");
    },

    onError: (err) => {
      console.error(err);
      toast.error("Delete failed");
    },
  });

  return {
    deleteMeetingItem: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}