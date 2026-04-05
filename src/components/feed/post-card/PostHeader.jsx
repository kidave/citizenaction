"use client";

import { Row } from "@/components/layout/Row";
import { Inline } from "@/components/layout/Inline";
import { UserIdentity } from "@/components/profile/UserIdentity";
import MenuButton from "@/components/feed/MenuButton";
import formatPostDate from "@/utils/posts/formatPostDate";

export default function PostHeader({
  post,
  canEdit,
  onEdit,
  onDelete,
}) {
  const formattedDate = formatPostDate(post.created_at);

  return (
    <Row className="flex-col md:flex-row justify-between gap-2">
      
      <Row className="items-start gap-3 min-w-0">
        <UserIdentity
          username={post.author_username}
          name={post.author_name}
          avatar={post.author_avatar}
          createdAt={formattedDate}
        />
      </Row>

      <Inline className="justify-end md:justify-start">
        <div className="flex items-center gap-2">

          {post.space_logo && (
            <img
              src={post.space_logo}
              className="h-6 w-6 rounded-md"
            />
          )}

          {post.scope_name && (
            <span className="text-xs text-muted-foreground">
              {post.scope_name}
            </span>
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

      </Inline>
    </Row>
  );
}