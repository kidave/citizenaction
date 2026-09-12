import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePositionTimeline(positionId, enabled = true) {
  return useQuery({
    queryKey: ["position-timeline", positionId],
    enabled: enabled && !!positionId,
    queryFn: async () => {
      const positionResult = await supabase
        .from("position")
        .select("id,name,slug,description,image_url,appointing_organization_id,category_id")
        .eq("id", positionId)
        .maybeSingle();

      if (positionResult.error) throw positionResult.error;
      if (!positionResult.data) throw new Error("Position record not found");

      const timelineResult = await supabase.rpc("get_position_timeline", { p_position_id: positionResult.data.id });
      if (timelineResult.error) throw timelineResult.error;

      let appointingName = null;
      if (positionResult.data.appointing_organization_id) {
        const organizationResult = await supabase
          .from("governance")
          .select("id,name")
          .eq("id", positionResult.data.appointing_organization_id)
          .maybeSingle();
        if (organizationResult.error) throw organizationResult.error;
        appointingName = organizationResult.data?.name || null;
      }

      return {
        position: { ...positionResult.data, appointing_organization_name: appointingName },
        timeline: timelineResult.data || [],
      };
    },
  });
}
