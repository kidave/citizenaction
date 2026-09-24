"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGovernanceAdmin() {
  return useQuery({
    queryKey: ["governance-admin-state"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_admin_state");
      if (error) throw error;
      return data || { is_admin: false, pending_count: 0 };
    },
  });
}

export function useGovernanceContributions(status = "pending", enabled = true) {
  return useQuery({
    queryKey: ["governance-contributions", status],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_contributions", {
        p_status: status || null,
      });
      if (error) throw error;
      return data || [];
    },
  });
}
