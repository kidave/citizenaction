"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { deletePostAttachmentsByPostId } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useDeletePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId) => {
      // Delete Storage
      await deletePostAttachmentsByPostId(postId);

      // Delete Database
      const { error } = await supabase.rpc("delete_post", {
        p_post_id: postId,
      });

      if (error) throw error;

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post"],
      });

      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      toast.success("Post deleted successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to delete post");
    },
  });

  return {
    deletePost: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
