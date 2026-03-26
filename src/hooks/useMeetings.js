import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useMeetings({
  clubId,
  meetingId,
  enabled = true,
}) {
  return useQuery({
    queryKey: ["meetings", clubId, meetingId],
    enabled: enabled,
    queryFn: async () => {
      let query = supabase
        .from("meeting_view")
        .select("*");

      if (clubId) {
        query = query.eq("club_id", clubId);
      }

      if (meetingId) {
        query = query.eq("id", meetingId).single();
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    },
  });
}