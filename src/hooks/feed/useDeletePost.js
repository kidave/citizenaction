"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useDeletePost() {

  const queryClient =
    useQueryClient();

  const mutation =
    useMutation({

      mutationFn:
        async (postId) => {

          // =========================
          // DELETE FEED SPACES
          // =========================

          const {
            error:
              spaceError,
          } = await supabase
            .from(
              "feed_space"
            )
            .delete()
            .eq(
              "feed_id",
              postId
            );

          if (spaceError) {
            throw spaceError;
          }

          // =========================
          // DELETE GOVERNANCE TAGS
          // =========================

          const {
            error: tagError,
          } = await supabase
            .from(
              "feed_governance_entities"
            )
            .delete()
            .eq(
              "feed_id",
              postId
            );

          if (tagError) {
            throw tagError;
          }

          // =========================
          // DELETE FEED
          // =========================

          const { error } =
            await supabase
              .from("feed")
              .delete()
              .eq(
                "id",
                postId
              );

          if (error) {
            throw error;
          }

          return true;
        },

      onSuccess: () => {

        queryClient
          .invalidateQueries({
            queryKey: ["feed"],
          });

        toast.success(
          "Post deleted successfully"
        );
      },

      onError: (error) => {

        console.error(
          "Delete post error:",
          error
        );

        toast.error(
          error.message ||
          "Failed to delete post"
        );
      },
    });

  return {
    deletePost:
      mutation.mutateAsync,

    isDeleting:
      mutation.isPending,
  };
}