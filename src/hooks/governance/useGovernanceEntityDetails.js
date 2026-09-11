import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceEntityDetails(entityId, enabled = true) {
  return useQuery({
    queryKey: ["governance-entity-details", entityId],
    enabled: Boolean(entityId) && enabled,
    queryFn: async () => {
      const [leaderResult, attachmentResult, linkResult, geographyResult] =
        await Promise.all([
          supabase.rpc("get_governance_leader_at", {
            p_entity_id: entityId,
            p_at: new Date().toISOString(),
          }),

          supabase
            .from("attachment")
            .select("*")
            .eq("governance_id", entityId)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true }),

          supabase
            .from("link")
            .select("*")
            .eq("governance_id", entityId)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true }),

          supabase
            .from("governance_geography")
            .select(
              `
                id,
                governance_id,
                geography_id,
                boundary_type,
                is_primary,
                valid_from,
                valid_to,
                notes,
                geographies (
                  id,
                  name,
                  official_name,
                  geography_type,
                  parent_id,
                  country_code,
                  osm_type,
                  osm_id,
                  admin_level,
                  source,
                  source_url,
                  center,
                  metadata
                )
              `,
            )
            .eq("governance_id", entityId)
            .order("is_primary", { ascending: false })
            .order("created_at", { ascending: true }),
        ]);

      if (leaderResult.error) throw leaderResult.error;
      if (attachmentResult.error) throw attachmentResult.error;
      if (linkResult.error) throw linkResult.error;
      if (geographyResult.error) throw geographyResult.error;

      const current = leaderResult.data?.[0] || null;
      let leader = null;

      if (current) {
        let role = current.position_name
          ? { id: `role-${current.id}`, name: current.position_name }
          : null;

        let person = current.person_name
          ? {
              id: `person-${current.id}`,
              name: current.person_name,
              image_url: current.person_avatar_url,
            }
          : null;

        const ids = [
          current.position_governance_id,
          current.person_governance_id,
        ].filter(Boolean);

        if (ids.length) {
          const { data, error } = await supabase
            .from("governance")
            .select(
              "id,name,short_name,entity_type,image_url,status,slug,profile_user_id",
            )
            .in("id", ids);

          if (error) throw error;

          const byId = new Map(
            (data || []).map((item) => [item.id, item]),
          );

          if (current.position_governance_id) {
            role = byId.get(current.position_governance_id) || role;
          }

          if (current.person_governance_id) {
            const personRecord = byId.get(current.person_governance_id);

            person = personRecord
              ? {
                  ...personRecord,
                  image_url:
                    current.person_avatar_url ||
                    personRecord.image_url,
                }
              : person;
          }
        }

        leader = {
          ...current,
          role,
          person,
        };
      }

      return {
        leader,
        geographies: geographyResult.data || [],
        attachments: attachmentResult.data || [],
        links: linkResult.data || [],
      };
    },
  });
}
