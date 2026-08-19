"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useUserSpaces(userId) {
  return useQuery({
    queryKey: ["user-spaces", userId],
    enabled: !!userId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_spaces", {
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
}
