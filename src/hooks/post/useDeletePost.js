"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { deletePostAttachmentsByPostId } from "@/lib/supabase/storage";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

export function useDeletePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId) => {
      await deletePostAttachmentsByPostId(postId);
      const { error } = await supabase.rpc("delete_post", { p_post_id: postId });
      if (error) throw error;
      return true;
    },
    onSuccess: (_, postId) => {
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      if (process.env.NODE_ENV !== "production") console.error(error);
      toast.error(error.message || "Failed to delete post");
    },
  });

  return { deletePost: mutation.mutateAsync, isDeleting: mutation.isPending };
}
