"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGeographicScopes({
  type,
  parentCode,
  search,
  enabled = true,
}) {
  return useQuery({
    queryKey: ["geo", type, parentCode, search],
    enabled: enabled && (!!type || !!search),

    queryFn: async () => {
      let query = supabase
        .from("geographic_scope_hierarchy")
        .select("code,name,type,logo_url,parent_code,grandparent_code")
        .order("name");

      if (type) {
        query = query.ilike("type", type);
      }

      // ✅ parent filtering (FIX)
      if (parentCode) {
        query = query.eq("parent_code", parentCode);
      }

      // ✅ search support
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    },
  });
}
