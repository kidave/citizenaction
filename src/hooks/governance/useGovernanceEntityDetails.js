import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceEntityDetails(entityId, enabled = true) {
  return useQuery({
    queryKey: ["governance-entity-details", entityId],
    enabled: Boolean(entityId) && enabled,

    queryFn: async () => {
      const [leaderResult, metadataResult, attachmentResult, linkResult] =
        await Promise.all([
          supabase.rpc("get_governance_leader_at", {
            p_entity_id: entityId,
            p_at: new Date().toISOString(),
          }),

          supabase
            .from("governance")
            .select("metadata")
            .eq("id", entityId)
            .maybeSingle(),

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
        ]);

      if (leaderResult.error) throw leaderResult.error;
      if (metadataResult.error) throw metadataResult.error;
      if (attachmentResult.error) throw attachmentResult.error;
      if (linkResult.error) throw linkResult.error;

      return {
        leader: leaderResult.data?.[0] || null,
        jurisdiction: metadataResult.data?.metadata?.osm_jurisdiction || null,
        attachments: attachmentResult.data || [],
        links: linkResult.data || [],
      };
    },
  });
}
