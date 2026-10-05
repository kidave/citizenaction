import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export const DEFAULT_GEOGRAPHY_FOCUS_ID =
  "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";

const GEOGRAPHY_SELECT =
  "id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center,metadata";

const EXCLUDED_FOCUS_TYPES = ["country", "city", "division"];

const GEOGRAPHY_TYPE_LABELS = {
  ward: "Ward",
  zone: "Zone",
  constituency: "Constituency",
  district: "District",
  sub_district: "Sub-district",
  local_government: "Local government",
  administrative_area: "Administrative area",
  neighborhood: "Neighborhood",
  suburb: "Suburb",
  village: "Village",
  town: "Town",
  state: "State",
};

const GEOGRAPHY_TYPE_ORDER = [
  "ward",
  "zone",
  "constituency",
  "district",
  "sub_district",
  "local_government",
  "administrative_area",
  "neighborhood",
  "suburb",
  "village",
  "town",
  "state",
];

export function getGeographyTypeLabel(type) {
  if (!type) return "Boundary";
  return GEOGRAPHY_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

function groupGeographies(rows) {
  const groups = new Map();

  rows.forEach((row) => {
    const type = row.geography_type || "other";
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(row);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const aIndex = GEOGRAPHY_TYPE_ORDER.indexOf(a);
      const bIndex = GEOGRAPHY_TYPE_ORDER.indexOf(b);
      const aRank = aIndex === -1 ? GEOGRAPHY_TYPE_ORDER.length : aIndex;
      const bRank = bIndex === -1 ? GEOGRAPHY_TYPE_ORDER.length : bIndex;
      return aRank - bRank || getGeographyTypeLabel(a).localeCompare(getGeographyTypeLabel(b));
    })
    .map(([type, items]) => ({
      value: type,
      label: getGeographyTypeLabel(type),
      items,
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
