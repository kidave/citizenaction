import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useClubMeetings({ clubId, enabled = true }) {
  return useQuery({
    queryKey: ["club-meetings", clubId],
    enabled: enabled && !!clubId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_full_view")
        .select("*")
        .eq("club_id", clubId)
        .order("meeting_date", { ascending: false });

      if (error) throw error;

      return data || [];
    },
  });
}