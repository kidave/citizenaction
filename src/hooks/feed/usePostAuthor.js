"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function usePostAuthor(authorId) {
  return useQuery({
    queryKey: queryKeys.posts.author(authorId),
    enabled: !!authorId,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("user_id, username, name, avatar_url")
        .eq("user_id", authorId)
        .single();

      if (error) throw error;

      return data;
    },
  });
}
