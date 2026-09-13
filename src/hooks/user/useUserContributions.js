"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useUserContributions(userId) {
  return useQuery({
    queryKey: queryKeys.users.contributions(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_contributions", { p_user_id: userId });
      if (error) throw error;
      return data || [];
    },
  });
}
