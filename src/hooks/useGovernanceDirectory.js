import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceDirectory(scopeType, scopeCode) {
  return useQuery({
    queryKey: ["governance-directory", scopeType, scopeCode],
    queryFn: async () => {
      let query = supabase
        .from("governance_entities")
        .select("*")
        .order("label", { ascending: true });

      if (scopeType && scopeCode) {
        query = query
          .eq("geo_scope_type", scopeType)
          .eq("geo_scope_code", scopeCode);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!scopeType && !!scopeCode,
  });
}
