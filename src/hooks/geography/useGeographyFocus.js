import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export const DEFAULT_GEOGRAPHY_FOCUS_ID =
  "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";

const GEOGRAPHY_SELECT =
  "id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center,metadata";

// India is the implicit default. The top-bar selector is for choosing a more specific jurisdiction.
const EXCLUDED_FOCUS_TYPES = ["country", "city", "division"];

export function useGeographyFocus({
  value = null,
  search = "",
  open = false,
  type = "all",
} = {}) {
  const effectiveValue = value || DEFAULT_GEOGRAPHY_FOCUS_ID;
  const normalizedSearch = search.trim();

  const selectedQuery = useQuery({
    queryKey: queryKeys.geography.byId(effectiveValue),
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

  const searchQuery = useInfiniteQuery({
    queryKey: queryKeys.geography.search({ search: normalizedSearch, type, limit: 50 }),
    enabled: open,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 50;
      let query = supabase
        .from("geographies")
        .select(GEOGRAPHY_SELECT)
        .order("name")
        .range(pageParam * pageSize, pageParam * pageSize + pageSize - 1);

      if (normalizedSearch) {
        const searchValue = normalizedSearch
          .replace(/[%_]/g, "")
          .slice(0, 80);

        if (searchValue) {
          query = query.or(
            "name.ilike.%" + searchValue + "%,official_name.ilike.%" + searchValue + "%",
          );
        }
      }

      if (type !== "all") query = query.eq("geography_type", type);
      else query = query.not("geography_type", "in", `(${EXCLUDED_FOCUS_TYPES.join(",")})`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 50 ? allPages.length : undefined,
    staleTime: 5 * 60 * 1000,
  });

  return {
    effectiveValue,
    selected: selectedQuery.data || null,
    options: searchQuery.data?.pages?.flatMap((page) => page) || [],
    hasNextPage: searchQuery.hasNextPage,
    fetchNextPage: searchQuery.fetchNextPage,
    isFetchingNextPage: searchQuery.isFetchingNextPage,
    isLoading: selectedQuery.isLoading || searchQuery.isLoading,
    isSearching: searchQuery.isLoading,
    error: selectedQuery.error || searchQuery.error || null,
  };
}
