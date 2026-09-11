import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceGeography(governanceId, enabled = true) {
  return useQuery({
    queryKey: ["governance-geography", governanceId],
    enabled: Boolean(governanceId) && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq("governance_id", governanceId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data || [];
    },
  });
}

export function useGovernanceGeographyMutation() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: async ({
      governanceId,
      geographyId,
      isPrimary = false,
    }) => {
      const { data, error } = await supabase.rpc(
        "set_governance_geography",
        {
          p_governance_id: governanceId,
          p_geography_id: geographyId,
          p_is_primary: isPrimary,
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["governance-geography", variables.governanceId],
      });
    },
  });

  const remove = useMutation({
    mutationFn: async ({ governanceId, relationshipId }) => {
      const { data, error } = await supabase.rpc(
        "delete_governance_geography",
        { p_id: relationshipId },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["governance-geography", variables.governanceId],
      });
    },
  });

  return {
    addGeography: add.mutateAsync,
    removeGeography: remove.mutateAsync,
    isAdding: add.isPending,
    isRemoving: remove.isPending,
  };
}
