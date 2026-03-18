import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useMeetings({
  clubId,
  meetingId,
  enabled = true,
}) {
  return useQuery({
    queryKey: ["meetings", clubId, meetingId],
    enabled: enabled && (!!clubId || !!meetingId),
    queryFn: async () => {
      let query = supabase
        .from("meeting_full_view")
        .select("*");

      if (clubId) {
        query = query.eq("club_id", clubId);
      }

      if (meetingId) {
        query = query.eq("id", meetingId).single();
      } else {
        query = query.order("meeting_date", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    },
  });
}