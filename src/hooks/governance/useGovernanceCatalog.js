import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useGovernanceCatalog({ enabled = true } = {}) {
  const categoriesQuery = useQuery({
    queryKey: ["governance-categories"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("category").select("id,name,slug").order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const locationsQuery = useQuery({
    queryKey: ["governance-locations"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("geographic_scope").select("id,name,type,parent_id").order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => ({
    categories: categoriesQuery.data || [],
    locations: locationsQuery.data || [],
    isLoading: categoriesQuery.isLoading || locationsQuery.isLoading,
    error: categoriesQuery.error || locationsQuery.error || null,
  }), [categoriesQuery.data, categoriesQuery.error, categoriesQuery.isLoading, locationsQuery.data, locationsQuery.error, locationsQuery.isLoading]);
}
