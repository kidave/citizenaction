"use client";

import { usePostCore } from "./usePostCore";
import { usePostAuthor } from "./usePostAuthor";
import { usePostSpace } from "./usePostSpace";
import { usePostGovernance } from "./usePostGovernance";
import { usePostStats } from "./usePostStats";
import { usePostMeeting } from "./usePostMeeting";
import { usePostPermissions } from "./usePostPermissions";
import { usePostScope } from "./usePostScope";

export function usePost(id, initialData) {
  const core = usePostCore(id, initialData);

  const author = usePostAuthor(core.data?.author_id);
  const scope = usePostScope(core.data?.scope_code);
  const space = usePostSpace(core.data?.space_id);
  const governance = usePostGovernance(id);
  const stats = usePostStats(id);
  const meeting = usePostMeeting(id);
  const permissions = usePostPermissions(id);

  const isLoading =
    core.isLoading ||
    author.isLoading ||
    scope.isLoading ||
    space.isLoading ||
    governance.isLoading;

  const post = core.data
    ? {
        ...core.data,

        // AUTHOR
        author_name: author.data?.name,
        author_username: author.data?.username,
        author_avatar: author.data?.avatar_url,

        // SPACE
        space_name: space.data?.name,
        space_slug: space.data?.slug,
        space_logo: space.data?.logo_url,

        // SCOPE
        scope_name: scope.data?.name,

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