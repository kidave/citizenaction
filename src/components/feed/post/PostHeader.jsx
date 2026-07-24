"use client";

import { Row } from "@/components/layout/Row";
import { Inline } from "@/components/layout/Inline";
import { UserIdentity } from "@/components/profile/UserIdentity";
import MenuButton from "@/components/feed/MenuButton";
import formatDate from "@/utils/date/formatDate";
import Image from "next/image";
import Link from "next/link";

export default function PostHeader({ post, canEdit, onEdit, onDelete }) {
  const formattedDate = formatDate(post.created_at);

  return (
    <Row className="flex-row justify-between gap-2">
      <Row className="min-w-0 items-start gap-3">
        <UserIdentity
          username={post.author_username}
          name={post.author_name}
          avatar={post.author_avatar}
          createdAt={formattedDate}
        />
      </Row>

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
    </Row>
  );
}
