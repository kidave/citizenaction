"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useAdminGovernanceEntities(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.admin.governanceEntities,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance")
        .select("id,name,short_name,slug,image_url,type,status")
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ governanceId, imageUrl }) => {
      const { data, error } = await supabase.rpc("update_governance_image", {
        p_governance_id: governanceId,
        p_image_url: imageUrl || null,
      });
      if (error) throw error;
      const updated = Array.isArray(data) ? data[0] : data;
      if (!updated?.id) throw new Error("Governance logo was uploaded but the governance record was not updated.");

      const { data: fresh, error: refreshError } = await supabase
        .from("governance")
        .select("id,name,short_name,slug,image_url,type,status")
        .eq("id", governanceId)
        .single();
      if (refreshError) throw refreshError;
      return fresh;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.admin.governanceEntities, (current = []) =>
        current.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.all });
    },
  });

  return { ...query, updateGovernanceImage: mutation.mutateAsync, isUpdating: mutation.isPending };
}
