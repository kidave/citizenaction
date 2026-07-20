"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostMeeting(postId) {
  return useQuery({
    queryKey: ["post-meeting", postId],
    enabled: !!postId,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_contribution")
        .select(
          `
          id,
          post_id,
          parent_id,
          content,
          contribution_type,
          status,
          user_id,
          guest_name,
          guest_designation,
          created_at,
          updated_at,
          profile:user_id (
            username,
            name,
            avatar_url,
            designation
          )
        `,
        )
        .eq("post_id", postId)
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,
        notes: item.content,
        avatar: item.profile?.avatar_url,
        name: item.profile?.name || item.guest_name,
        username: item.profile?.username,
      }));
    },
  });
}
