import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePositionTimeline(governanceId, enabled = true) {
  return useQuery({
    queryKey: ["position-timeline", governanceId],
    enabled: enabled && !!governanceId,
    queryFn: async () => {
      const positionResult = await supabase
        .from("position")
        .select("id,name,governance_id,slug,description,image_url,appointing_governance_id")
        .eq("governance_id", governanceId)
        .maybeSingle();

      if (positionResult.error) throw positionResult.error;
      if (!positionResult.data) throw new Error("Position record not found");

      const timelineResult = await supabase.rpc("get_position_timeline", {
        p_position_id: positionResult.data.id,
      });
      if (timelineResult.error) throw timelineResult.error;

      let appointingName = null;
      if (positionResult.data.appointing_governance_id) {
        const organizationResult = await supabase
          .from("governance")
          .select("id,name")
          .eq("id", positionResult.data.appointing_governance_id)
          .maybeSingle();
        if (organizationResult.error) throw organizationResult.error;
        appointingName = organizationResult.data?.name || null;
      }

      return {
        position: {
          ...positionResult.data,
          appointing_governance_name: appointingName,
        },
        timeline: timelineResult.data || [],
      };
    },
  });
}
