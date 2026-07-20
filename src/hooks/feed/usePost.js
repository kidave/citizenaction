"use client";

import { usePostCore } from "./usePostCore";
import { usePostGovernance } from "./usePostGovernance";
import { usePostStats } from "./usePostStats";
import { usePostContribution } from "./usePostContribution";
import { usePostPermissions } from "./usePostPermissions";
import { usePostSpaces } from "./usePostSpaces";

export function usePost(id, initialData) {
  const core = usePostCore(id, initialData);

  const governance = usePostGovernance(id);

  const spaces = usePostSpaces(id);

  const stats = usePostStats(id);

  const meeting = usePostContribution(id);

  const permissions = usePostPermissions(id);

  const isLoading = core.isLoading || governance.isLoading || spaces.isLoading;

  const post = core.data
    ? {
        ...core.data,

        // SPACES
        spaces: spaces.data || [],

        // GOVERNANCE
        governance_entities: governance.data || [],

        governance: governance.data || [],

        // STATS
        support_count: stats.data?.support_count || 0,

        contribute_count: stats.data?.contribute_count || 0,

        is_supported: stats.data?.is_supported || false,

        is_contributing: stats.data?.is_contributing || false,

        // MEETING
        meeting_attendees: meeting.data || [],

        // PERMISSIONS
        can_manage: permissions.data?.can_manage,
      }
    : null;

  return {
    data: post,
    isLoading,
  };
}
