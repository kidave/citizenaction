import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useMeeting(id) {
  return useQuery({
    queryKey: ["meeting", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_full_view")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    },
  });
}