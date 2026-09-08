import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useAdminDashboard(enabled = true) {
  return useQuery({
    queryKey: ["admin-dashboard"],
    enabled,
    queryFn: async () => {
      const [{ count: userCount, error: userError }, { count: pendingSpaces, error: spaceError }, { count: pendingGovernance, error: governanceError }] = await Promise.all([
        supabase.from("profile").select("user_id", { count: "exact", head: true }),
        supabase.from("space_application").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.rpc("get_governance_admin_state"),
      ]);

      if (userError) throw userError;
      if (spaceError) throw spaceError;
      if (governanceError) throw governanceError;

      return {
        userCount: userCount || 0,
        pendingSpaceApplications: pendingSpaces || 0,
        pendingGovernanceChanges: Number(pendingGovernance?.pending_count || 0),
      };
    },
  });
}
