import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGeographyBrowser({
  parentId = null,
  search = "",
  enabled = true,
}) {
  return useQuery({
    queryKey: ["geography-browser", parentId, search],
    enabled,
    queryFn: async () => {
      let query = supabase
        .from("geographies")
        .select(
          "id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center,metadata",
        )
        .order("name", { ascending: true })
        .limit(search.trim() ? 50 : 200);

      if (search.trim()) {
        const value = search.trim().replace(/[%_]/g, "").slice(0, 80);
        query = query.or(
          `name.ilike.%${value}%,official_name.ilike.%${value}%`,
        );
      } else if (parentId) {
        query = query.eq("parent_id", parentId);
      } else {
        query = query
          .eq("geography_type", "country")
          .eq("country_code", "IN");
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}

export async function fetchGeographyGeometry(geography) {
  if (!geography?.osm_type || !geography?.osm_id) return null;

  const response = await fetch(
    `/api/osm-admin-lookup?osm_type=${encodeURIComponent(
      geography.osm_type,
    )}&osm_id=${encodeURIComponent(geography.osm_id)}`,
  );

  if (!response.ok) {
    throw new Error("Boundary lookup failed");
  }

  const data = await response.json();
  return data?.feature?.geometry || null;
}
