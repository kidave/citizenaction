// hooks/useClub.js

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useClub({ spaceSlug, scopeType, scopeCode, enabled = true }) {
  const qc = useQueryClient();

  // 🔹 FETCH SINGLE CLUB
  const query = useQuery({
    queryKey: ["club", spaceSlug, scopeType, scopeCode],
    enabled: enabled && !!spaceSlug && !!scopeType && !!scopeCode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_view")
        .select("*")
        .eq("community_slug", spaceSlug)
        .eq("scope_type", scopeType)
        .eq("scope_code", scopeCode)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // 🔹 UPDATE
  const update = async (payload) => {
    const { error } = await supabase
      .from("club")
      .update(payload)
      .eq("community_slug", spaceSlug)
      .eq("scope_type", scopeType)
      .eq("scope_code", scopeCode);

    if (error) throw error;

    qc.invalidateQueries(["club", spaceSlug, scopeType, scopeCode]);
    qc.invalidateQueries(["clubs"]);
  };

  // 🔹 DELETE
  const remove = async () => {
    const { error } = await supabase
      .from("club")
      .delete()
      .eq("community_slug", spaceSlug)
      .eq("scope_type", scopeType)
      .eq("scope_code", scopeCode);

    if (error) throw error;

    qc.invalidateQueries(["clubs"]);
  };

  return {
    ...query,
    club: query.data,
    update,
    remove,
  };
}