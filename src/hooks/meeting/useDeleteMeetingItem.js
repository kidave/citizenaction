"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useDeleteMeetingItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (itemId) => {
      const { error } = await supabase
        .from("meeting_item")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post-meeting"],
      });

      toast.success("Deleted successfully");
    },

    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Delete failed");
    },
  });

  return {
    deleteMeetingItem: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
