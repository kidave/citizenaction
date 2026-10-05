import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

const geographyGeometryCache = new Map();

export const GEOGRAPHY_METADATA_SELECT =
  "id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center,metadata";

export function useGeographyBrowser({ parentId = null, search = "", type = "all", enabled = true }) {
  const PAGE_SIZE = 50;
  const query = useInfiniteQuery({
    queryKey: search.trim()
      ? queryKeys.geography.browserSearch({ search: search.trim(), type, limit: PAGE_SIZE })
      : queryKeys.geography.children(parentId || "india", type),
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      let request = supabase
        .from("geographies")
        .select(GEOGRAPHY_METADATA_SELECT)
        .order("name", { ascending: true })
        .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

      if (search.trim()) {
        const value = search.trim().replace(/[%_]/g, "").slice(0, 80);
        if (value) {
          request = request.or(
            `name.ilike.%${value}%,official_name.ilike.%${value}%`,
          );
        }
      } else if (parentId) {
        request = request.eq("parent_id", parentId);
      } else {
        request = request.eq("geography_type", "country").eq("country_code", "IN");
      }

      if (type !== "all") request = request.eq("geography_type", type);

      const { data, error } = await request;
      if (error) throw error;

      const rows = data || [];
      if (!rows.length) return rows;

      const ids = rows.map((item) => item.id);
      const { data: children, error: childError } = await supabase
        .from("geographies")
        .select("parent_id")
        .in("parent_id", ids)
        .limit(1000);
      if (childError) throw childError;

      const parentIdsWithChildren = new Set((children || []).map((item) => item.parent_id));
      return rows.map((item) => ({
        ...item,
        has_children: parentIdsWithChildren.has(item.id),
      }));
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data?.pages?.flatMap((page) => page) || [],
  };
}
