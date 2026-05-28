"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function usePostScope(scopeCode) {
  return useQuery({
    queryKey: ["post-scope", scopeCode],

    enabled: !!scopeCode,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("geographic_scope")
        .select(
          `
            code,
            name
          `,
        )
        .eq("code", scopeCode)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
