import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceEntityDetails(entityId, enabled = true) {
  return useQuery({
    queryKey: ["governance-entity-details", entityId],
    enabled: Boolean(entityId) && enabled,
    queryFn: async () => {
      const [leaderResult, attachmentResult, linkResult, geographyResult] = await Promise.all([
        supabase.rpc("get_governance_leader_at", { p_entity_id: entityId, p_at: new Date().toISOString() }),
        supabase.from("attachment").select("*").eq("governance_id", entityId).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("link").select("*").eq("governance_id", entityId).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("governance").select(`geography_id, geographies (id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center,metadata)`).eq("id", entityId).maybeSingle(),
      ]);

      if (leaderResult.error) throw leaderResult.error;
      if (attachmentResult.error) throw attachmentResult.error;
      if (linkResult.error) throw linkResult.error;
      if (geographyResult.error) throw geographyResult.error;

      const current = leaderResult.data?.[0] || null;
      let leader = null;

      if (current) {
        const [positionResult, personResult] = await Promise.all([
          current.position_id ? supabase.from("position").select("id,name,slug,image_url,description,appointing_organization_id").eq("id", current.position_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
          current.person_id ? supabase.from("person").select("id,name,slug,image_url,profile_user_id,biography,website").eq("id", current.person_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
        ]);
        if (positionResult.error) throw positionResult.error;
        if (personResult.error) throw personResult.error;

        leader = {
          ...current,
          role: positionResult.data || (current.position_name ? { id: current.position_id, name: current.position_name } : null),
          person: personResult.data || (current.person_name ? { id: current.person_id, name: current.person_name, image_url: current.person_avatar_url } : null),
        };
      }

      return {
        leader,
        geography: geographyResult.data?.geographies || null,
        geographyId: geographyResult.data?.geography_id || null,
        attachments: attachmentResult.data || [],
        links: linkResult.data || [],
      };
    },
  });
}
