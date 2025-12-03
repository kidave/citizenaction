// hooks/useWardMapillary.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";

export function useWardMapillary(wardCode, options = {}) {
  const { objectTypes = null, roadFid = null, limit = null } = options;

  return useQuery({
    queryKey: ["mapillary_features", wardCode, objectTypes, roadFid],
    enabled: !!wardCode,
    queryFn: async () => {
      let q = supabase.from("mapillary_features").select("*").eq("ward_code", wardCode);
      if (objectTypes && objectTypes.length) q = q.in("object_value", objectTypes);
      if (roadFid) q = q.eq("road_fid", roadFid);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
  });
}
