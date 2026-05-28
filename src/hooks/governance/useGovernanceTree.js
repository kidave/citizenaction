"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceTree({
  parentId = null,
  scopes = [],
  search,
  enabled = true,
}) {
  return useQuery({
    queryKey: ["governance-tree", parentId, scopes, search],
    enabled,
    queryFn: async () => {
      let query = supabase
        .from("governance_entity_view")
        .select("*")
        .order("label");

      /* -------------------------
         HIERARCHY
      ------------------------- */
      if (parentId) {
        query = query.eq("parent_id", parentId);
      } else {
        query = query.is("parent_id", null);
      }

      /* -------------------------
         SCOPES (NEW LOGIC)
      ------------------------- */
      if (scopes?.length > 0) {
        const conditions = scopes.map((s) => {
          /* -------------------------
            ALL STATES CASE
          ------------------------- */
          if (s.type === "state" && !s.code) {
            return `geo_scope_type.eq.state`;
          }

          /* -------------------------
            NORMAL
          ------------------------- */
          return `and(geo_scope_type.eq.${s.type},geo_scope_code.eq.${s.code})`;
        });

        query = query.or(conditions.join(","));
      }

      /* -------------------------
         SEARCH
      ------------------------- */
      if (search) {
        query = query.ilike("label", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
  });
}
