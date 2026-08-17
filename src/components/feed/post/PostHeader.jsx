"use client";

import { UserIdentity } from "@/components/profile/UserIdentity";
import MenuButton from "@/components/ui/MenuButton";
import formatDate from "@/utils/date/formatDate";
import Image from "next/image";
import Link from "next/link";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";

export default function PostHeader({ post, canEdit, onEdit, onDelete }) {
  const formattedDate = formatDate(post.created_at);
  const governance = post.governance ?? [];

  return (
    <div className="flex flex-row justify-between gap-2">
      <div className="flex min-w-0 items-start gap-3">
        <UserIdentity
          username={post.author_username}
          name={post.author_name}
          avatar={post.author_avatar}
          createdAt={formattedDate}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end md:justify-start">
        <div className="flex items-center gap-2">
          {post.space_logo && post.space_slug && (
            <Link href={`/space/${post.space_slug}`}>
              <Image
                src={post.space_logo}
                alt="space logo"
                width={24}
                height={24}
                className="h-6 w-6 cursor-pointer rounded-md hover:opacity-80"
              />
            </Link>
          )}
          <GovernanceAvatarGroup authorities={governance} />
        </div>

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
