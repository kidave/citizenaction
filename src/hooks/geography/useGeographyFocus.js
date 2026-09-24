import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export const DEFAULT_GEOGRAPHY_FOCUS_ID =
  "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";

const GEOGRAPHY_SELECT =
  "id,name,official_name,geography_type,parent_id";

export function useGeographyFocus({
  value = null,
  search = "",
  open = false,
} = {}) {
  const effectiveValue = value || DEFAULT_GEOGRAPHY_FOCUS_ID;
  const normalizedSearch = search.trim();

  const selectedQuery = useQuery({
    queryKey: queryKeys.geography.focusSelected(effectiveValue),
    enabled: !!effectiveValue,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geographies")
        .select(GEOGRAPHY_SELECT)
        .eq("id", effectiveValue)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.geography.focusSearch(normalizedSearch),
    enabled: open,
    queryFn: async () => {
      let query = supabase
        .from("geographies")
        .select(GEOGRAPHY_SELECT)
        .order("name")
        .limit(50);

      if (normalizedSearch) {
        const searchValue = normalizedSearch
          .replace(/[%_]/g, "")
          .slice(0, 80);

        if (searchValue) {
          query = query.or(
            \`name.ilike.%${searchValue}%,official_name.ilike.%${searchValue}%\`,
          );
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    effectiveValue,
    selected: selectedQuery.data || null,
    options: searchQuery.data || [],
    isLoading: selectedQuery.isLoading || searchQuery.isLoading,
    isSearching: searchQuery.isLoading,
    error: selectedQuery.error || searchQuery.error || null,
  };
}
