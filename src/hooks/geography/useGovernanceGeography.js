import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

const geographySelect = `
  geography_id,
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
`;

const resourceConfig = {
  governance: { table: "governance", key: "governanceId" },
  position: { table: "position", key: "positionId" },
};

function getConfig(entityType = "governance") {
  const config = resourceConfig[entityType];
  if (!config) throw new Error(`Unsupported geography entity: ${entityType}`);
  return config;
}

export function useGovernanceGeography(entityId, enabled = true, entityType = "governance") {
  return useQuery({
    queryKey: [`${entityType}-geography`, entityId],
    enabled: Boolean(entityId) && enabled,
    queryFn: async () => {
      const { table, key } = getConfig(entityType);
      const { data, error } = await supabase
        .from(table)
        .select(geographySelect)
        .eq("id", entityId)
        .maybeSingle();

      if (error) throw error;
      return data?.geography_id
        ? [{
            [key]: entityId,
            geography_id: data.geography_id,
            geographies: data.geographies,
          }]
        : [];
    },
  });
}

export function useGovernanceGeographyMutation() {
  const queryClient = useQueryClient();

  const invalidate = (entityId, entityType = "governance") => {
    queryClient.invalidateQueries({ queryKey: [`${entityType}-geography`, entityId] });
    queryClient.invalidateQueries({ queryKey: ["governance-entity", entityId] });
    queryClient.invalidateQueries({ queryKey: ["governance-entity-details", entityId] });
    queryClient.invalidateQueries({ queryKey: ["governance-directory"] });
  };

  const set = useMutation({
    mutationFn: async ({ entityId, geographyId, entityType = "governance", governanceId, positionId }) => {
      const id = entityId || governanceId || positionId;
      const { table } = getConfig(entityType);
      const { data, error } = await supabase
        .from(table)
        .update({ geography_id: geographyId })
        .eq("id", id)
        .select("id,geography_id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => invalidate(variables.entityId || variables.governanceId || variables.positionId, variables.entityType),
  });

  const clear = useMutation({
    mutationFn: async ({ entityId, entityType = "governance", governanceId, positionId }) => {
      const id = entityId || governanceId || positionId;
      const { table } = getConfig(entityType);
      const { data, error } = await supabase
        .from(table)
        .update({ geography_id: null })
        .eq("id", id)
        .select("id,geography_id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => invalidate(variables.entityId || variables.governanceId || variables.positionId, variables.entityType),
  });

  return {
    setGeography: set.mutateAsync,
    removeGeography: clear.mutateAsync,
    isSetting: set.isPending,
    isRemoving: clear.isPending,
  };
}
