"use client";


import { Row } from "@/components/layout/Row";
import { Inline } from "@/components/layout/Inline";
import { UserIdentity } from "@/components/profile/UserIdentity";
import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
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

        <GovernanceAvatarGroups
          entities={post.governance_entities}
        />

        <MenuButton
          canEdit={canEdit}
          onEdit={(e) => {
            e?.stopPropagation();
            onEdit?.();
          }}
          onDelete={(e) => {
            e?.stopPropagation();
            onDelete?.();
          }}
        />

      </Inline>
    </Row>
  );
}