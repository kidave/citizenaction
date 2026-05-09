// hooks/feed/usePostMeeting.js

"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePostMeeting(postId) {
  return useQuery({
    queryKey: ["post-meeting", postId],
    enabled: !!postId,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_item")
        .select(`
          id,
          notes,
          user_id,
          guest_name,
          guest_designation,
          profile:user_id (
            username,
            name,
            avatar_url,
            designation
          )
        `)
        .eq("feed_id", postId);

      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,

        avatar: item.profile?.avatar_url,
        name: item.profile?.name || item.guest_name,
        username: item.profile?.username,
      }));
    },
  });
}