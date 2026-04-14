import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePublicProfile(username) {
  return useQuery({
    queryKey: ["public-profile", username],
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_profile")
        .select("*")
        .eq("username", username)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
