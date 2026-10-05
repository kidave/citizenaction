import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

const geographyGeometryCache = new Map();

export const GEOGRAPHY_METADATA_SELECT =
  "id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center,metadata";

export function useGeographyBrowser({ parentId = null, search = "", type = "all", enabled = true }) {
  return useQuery({
    queryKey: search.trim() ? queryKeys.geography.search({ search: search.trim(), type, limit: 50 }) : queryKeys.geography.children(parentId || "india"),
    enabled,
    queryFn: async () => {
      let query = supabase
        .from("geographies")
        .select(GEOGRAPHY_METADATA_SELECT)
        .order("name", { ascending: true })
        .limit(search.trim() ? 50 : 200);

      if (search.trim()) {
        const value = search.trim().replace(/[%_]/g, "").slice(0, 80);
        query = query.or(`name.ilike.%${value}%,official_name.ilike.%${value}%`);
      } else if (parentId) {
        query = query.eq("parent_id", parentId);
      } else {
        query = query.eq("geography_type", "country").eq("country_code", "IN");
      }

      if (type !== "all") query = query.eq("geography_type", type);

      const { data, error } = await query;
      if (error) throw error;

      const rows = data || [];
      if (!rows.length) return rows;

      // Navigation follows the actual parent_id relationship, not admin_level
      // or an assumed country/state/district sequence. Mark which records have
      // children so the UI can offer navigation only where it is meaningful.
      const ids = rows.map((item) => item.id);
      const { data: children, error: childError } = await supabase
        .from("geographies")
        .select("parent_id")
        .in("parent_id", ids)
        .limit(1000);
      if (childError) throw childError;

      const parentIdsWithChildren = new Set((children || []).map((item) => item.parent_id));
      return rows.map((item) => ({ ...item, has_children: parentIdsWithChildren.has(item.id) }));
    },
  });
}

export async function fetchGeographyGeometry(geography) {
  const geographyId = geography?.id;
  if (!geographyId) return null;
  if (geographyGeometryCache.has(geographyId)) return geographyGeometryCache.get(geographyId);

  const { data, error } = await supabase.rpc("get_geography_geometry", { p_geography_id: geographyId });
  if (error) throw error;
  if (data) {
    geographyGeometryCache.set(geographyId, data);
    return data;
  }

  if (!geography?.osm_type || !geography?.osm_id) return null;
  const response = await fetch(`/api/osm-admin-lookup?osm_type=${encodeURIComponent(geography.osm_type)}&osm_id=${encodeURIComponent(geography.osm_id)}`);
  if (!response.ok) throw new Error("Boundary lookup failed");
  const fallbackData = await response.json();
  const geometry = fallbackData?.feature?.geometry || null;
  if (geometry) geographyGeometryCache.set(geographyId, geometry);
  return geometry;
}
