"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function useUpsertMeetingItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ item_id, feed_id, notes }) => {
      const content = notes;

      // UPDATE EXISTING
      if (item_id) {
        const { error } = await supabase
          .from("post_contribution")
          .update({
            content,
            updated_by: user.id,
          })
          .eq("id", item_id);

        if (error) throw error;

        return;
      }

      // CREATE NEW
      try {
        const { error } = await supabase.from("post_contribution").insert({
          post_id: feed_id,
          user_id: user.id,
          content,
          contribution_type: "comment",
          updated_by: user.id,
        });

        if (error) throw error;
      } catch (err) {
        // Existing user record → update instead
        if (err.message?.includes("duplicate key")) {
          const { error: updateError } = await supabase
            .from("post_contribution")
            .update({
              content,
              updated_by: user.id,
            })
            .eq("post_id", feed_id)
            .eq("user_id", user.id);

          if (updateError) throw updateError;
        } else {
          throw err;
        }
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post-meeting"],
      });

      toast.success("Saved successfully");
    },

    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Failed to save");
    },
  });

  return {
    upsertMeetingItem: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
