import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceDirectoryGeographies({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["governance-directory-geographies"],
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance")
        .select("geography_id,geographies:geography_id(id,name,geography_type)")
        .not("geography_id", "is", null);

      if (error) throw error;

      const seen = new Map();
      for (const row of data || []) {
        const geography = row?.geographies;
        if (geography?.id) seen.set(geography.id, geography);
      }

      return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
  });
}
