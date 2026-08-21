"use client";

import { UserIdentity } from "@/components/profile/UserIdentity";
import MenuButton from "@/components/ui/MenuButton";

import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";

import formatDate from "@/utils/date/formatDate";

export default function PostHeader({ post, canEdit, onEdit, onDelete }) {
  const formattedDate = formatDate(post.created_at);

  const governance = post.governance ?? [];
  const spaces = Array.isArray(post.spaces) ? post.spaces : [];

  return (
    <div className="flex flex-row justify-between gap-2">
      {/* ==========================================
          AUTHOR
      ========================================== */}

      <div className="flex min-w-0 items-start gap-3">
        <UserIdentity
          username={post.author_username}
          name={post.author_name}
          avatar={post.author_avatar}
          createdAt={formattedDate}
        />
      </div>

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        {/* ========================================
            SPACES
        ======================================== */}

        <SpaceAvatarGroup spaces={spaces} />

        {/* ========================================
            GOVERNANCE
        ======================================== */}

        {governance.length > 0 && (
          <GovernanceAvatarGroup authorities={governance} />
        )}

        {/* ========================================
            MENU
        ======================================== */}

        {canEdit && (
          <MenuButton
            onEdit={(e) => {
              e?.stopPropagation();
              onEdit?.();
            }}
            onDelete={(e) => {
              e?.stopPropagation();
              onDelete?.();
            }}
          />
        )}
      </div>
    </div>
  );
}
