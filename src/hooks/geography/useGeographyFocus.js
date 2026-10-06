import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { getGeographyCategoryLabel, getGeographyTypeLabel as getSharedGeographyTypeLabel } from "@/config/geography/boundaryCategories";

export const DEFAULT_GEOGRAPHY_FOCUS_ID =
  "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";

const GEOGRAPHY_SELECT =
  "id,name,official_name,geography_type,boundary_category,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center,metadata";

const EXCLUDED_FOCUS_TYPES = ["country", "city", "division"];

export function getGeographyTypeLabel(type) {
  return getSharedGeographyTypeLabel(type);
}

function groupGeographies(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const category = row.boundary_category || "administrative";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(row);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({
      value: category,
      label: getGeographyCategoryLabel(category),
      items: items.sort((x, y) =>
        getGeographyTypeLabel(x.geography_type).localeCompare(getGeographyTypeLabel(y.geography_type)) ||
        x.name.localeCompare(y.name)
      ),
    }));
}

export function useGeographyFocus({ value = null, search = "", open = false } = {}) {
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
    queryKey: queryKeys.geography.focusSearch(normalizedSearch),
    enabled: open,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 50;
      let query = supabase
        .from("geographies")
        .select(GEOGRAPHY_SELECT)
        .order("geography_type")
        .order("name")
        .range(pageParam * pageSize, pageParam * pageSize + pageSize - 1);

      if (normalizedSearch) {
        const searchValue = normalizedSearch.replace(/[%_]/g, "").slice(0, 80);
        if (searchValue) {
          query = query.or(
            "name.ilike.%" + searchValue + "%,official_name.ilike.%" + searchValue + "%",
          );
        }
      }

      query = query.not(
        "geography_type",
        "in",
        `(${EXCLUDED_FOCUS_TYPES.join(",")})`,
      );

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 50 ? allPages.length : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const options = searchQuery.data?.pages?.flatMap((page) => page) || [];

  return {
    effectiveValue,
    selected: selectedQuery.data || null,
    options,
    groupedOptions: groupGeographies(options),
    hasNextPage: searchQuery.hasNextPage,
    fetchNextPage: searchQuery.fetchNextPage,
    isFetchingNextPage: searchQuery.isFetchingNextPage,
    isLoading: selectedQuery.isLoading || searchQuery.isLoading,
    isSearching: searchQuery.isLoading,
    error: selectedQuery.error || searchQuery.error || null,
  };
}
