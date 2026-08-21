"use client";

import { UserIdentity } from "@/components/profile/UserIdentity";
import MenuButton from "@/components/ui/MenuButton";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";

import formatDate from "@/utils/date/formatDate";

import Image from "next/image";
import Link from "next/link";

export default function PostHeader({ post, canEdit, onEdit, onDelete }) {
  const formattedDate = formatDate(post.created_at);

  const governance = post.governance ?? [];

  const spaces = Array.isArray(post.spaces) ? post.spaces : [];

  /*
   * Show a maximum of 3 Space avatars.
   * If there are more, show +N.
   */
  const visibleSpaces = spaces.slice(0, 3);
  const remainingSpaces = Math.max(spaces.length - 3, 0);

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

        {spaces.length > 0 && (
          <div className="flex items-center -space-x-2">
            {visibleSpaces.map((space) => (
              <Link
                key={space.id}
                href={`/space/${space.slug}`}
                onClick={(e) => e.stopPropagation()}
                title={space.name}
                className="relative z-0 transition-transform hover:z-10 hover:scale-105"
              >
                {space.logo_url ? (
                  <Image
                    src={space.logo_url}
                    alt={space.name || "Space"}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-md border-2 border-background bg-background object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-background bg-muted text-[10px] font-medium">
                    {space.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
              </Link>
            ))}

            {/* ======================================
                REMAINING SPACES
            ====================================== */}

            {remainingSpaces > 0 && (
              <div
                title={`${remainingSpaces} more Space${
                  remainingSpaces > 1 ? "s" : ""
                }`}
                className="relative z-0 flex h-7 w-7 items-center justify-center rounded-md border-2 border-background bg-muted text-[9px] font-medium text-muted-foreground"
              >
                +{remainingSpaces}
              </div>
            )}
          </div>
        )}

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
