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

  return useMemo(() => ({
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error || null,
  }), [categoriesQuery.data, categoriesQuery.error, categoriesQuery.isLoading]);
}
