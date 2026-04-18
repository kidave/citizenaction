"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGeographicScopes({ type, enabled = true }) {
  return useQuery({
    queryKey: ["geo", type],
    enabled: enabled && !!type,

    queryFn: async () => {
      console.log("Fetching scopes for:", type);

      const { data, error } = await supabase
        .from("geographic_scope_hierarchy")
        .select("code,name,type,logo_url,metadata")
        .ilike("type", type)
        .order("name");

      console.log("Scopes result:", data, error);

      if (error) throw error;

      return data || [];
    },
  });
}