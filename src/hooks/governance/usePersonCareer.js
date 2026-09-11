import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function usePersonCareer(governanceId, enabled = true) {
  return useQuery({
    queryKey: ["person-career", governanceId],
    enabled: enabled && !!governanceId,
    queryFn: async () => {
      const personResult = await supabase
        .from("person")
        .select("id,name,governance_id,slug,biography,image_url,website,profile_user_id")
        .eq("governance_id", governanceId)
        .maybeSingle();

      if (personResult.error) throw personResult.error;
      if (!personResult.data) throw new Error("Person record not found");

      const careerResult = await supabase.rpc("get_person_career", {
        p_person_id: personResult.data.id,
      });
      if (careerResult.error) throw careerResult.error;

      return {
        person: personResult.data,
        career: careerResult.data || [],
      };
    },
  });
}
