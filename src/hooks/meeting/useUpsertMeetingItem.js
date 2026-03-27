"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useUpsertMeetingItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ feed_id, user_id, notes }) => {
      const { error } = await supabase
        .from("meeting_item")
        .upsert(
          { feed_id, user_id, notes },
          { onConflict: "feed_id,user_id" }
        );

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Saved successfully");
    },

    onError: (err) => {
      console.error(err);
      toast.error("Failed to save");
    },
  });

  return {
    upsertMeetingItem: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}