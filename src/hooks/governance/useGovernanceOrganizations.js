import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useGovernanceOrganizations({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.governance.organizations,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance")
        .select(
          "id,name,short_name,slug,type,status,image_url,current_holder_name,current_holder_image_url",
        )
        .neq("status", "deleted")
        .order("name")
        .limit(500);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
