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

export function useGovernanceGeography(governanceId, enabled = true) {
  return useQuery({
    queryKey: ["governance-geography", governanceId],
    enabled: Boolean(governanceId) && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance")
        .select(geographySelect)
        .eq("id", governanceId)
        .maybeSingle();

      if (error) throw error;
      return data?.geography_id
        ? [{
            governance_id: governanceId,
            geography_id: data.geography_id,
            geographies: data.geographies,
          }]
        : [];
    },
  });
}

export function useGovernanceGeographyMutation() {
  const queryClient = useQueryClient();

  const invalidate = (governanceId) => {
    queryClient.invalidateQueries({
      queryKey: ["governance-geography", governanceId],
    });

    queryClient.invalidateQueries({
      queryKey: ["governance-entity", governanceId],
    });

    queryClient.invalidateQueries({
      queryKey: ["governance-entity-details", governanceId],
    });
  };

  const set = useMutation({
    mutationFn: async ({ governanceId, geographyId }) => {
      const { data, error } = await supabase
        .from("governance")
        .update({ geography_id: geographyId })
        .eq("id", governanceId)
        .select("id,geography_id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => invalidate(variables.governanceId),
  });

  const clear = useMutation({
    mutationFn: async ({ governanceId }) => {
      const { data, error } = await supabase
        .from("governance")
        .update({ geography_id: null })
        .eq("id", governanceId)
        .select("id,geography_id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => invalidate(variables.governanceId),
  });

  return {
    setGeography: set.mutateAsync,
    removeGeography: clear.mutateAsync,
    isSetting: set.isPending,
    isRemoving: clear.isPending,
  };
}
