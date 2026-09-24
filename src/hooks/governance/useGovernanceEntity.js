import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceEntity(entityId, enabled = true) {
  return useQuery({
    queryKey: ["governance-entity", entityId],
    enabled: Boolean(entityId) && enabled,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance")
        .select("*")
        .eq("id", entityId)
        .maybeSingle();

      if (error) throw error;

      return data;
    },
  });
}
