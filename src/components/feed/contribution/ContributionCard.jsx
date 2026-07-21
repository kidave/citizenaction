"use client";

import { Card } from "@/components/ui/card";

import { Row } from "@/components/layout/Row";

import { UserIdentity } from "@/components/profile/UserIdentity";
import formatDate from "@/utils/date/formatDate";
import PostActions from "@/components/feed/post/PostActions";

import PostContent from "@/components/feed/post/PostContent";
import PostMetadata from "@/components/feed/post/PostMetadata";
import PostAttachments from "@/components/feed/post/PostAttachments";

import ContributionFooter from "./ContributionFooter";

export default function ContributionCard({
  contribution,
  post,
  canEdit = false,
  onEdit,
  onDelete,
}) {
  if (!contribution) return null;
  const formattedDate = formatDate(contribution.created_at);

  return (
    <Card>
      <div className="flex flex-col gap-4 p-4">
        {/* Header */}

        <Row className="items-start justify-between gap-3">
          <UserIdentity
            username={contribution.username}
            name={contribution.name}
            avatar={contribution.avatar_url}
            createdAt={formattedDate}
          />

          {canEdit && (
            <PostActions canEdit onEdit={onEdit} onDelete={onDelete} />
          )}
        </Row>

        {/* Attachments */}

        {contribution.attachments?.length > 0 && (
          <div className="overflow-hidden rounded-2xl">
            <PostAttachments attachments={contribution.attachments} />
          </div>
        )}

        {/* Content */}

        <PostContent
          post={{
            ...contribution,
            summary: contribution.title,
            details: contribution.content,
            type: "contribution",
          }}
          forceExpanded
          showBadge={false}
        />

        <PostMetadata
          post={{
            ...contribution,
            type: "contribution",
          }}
          forceExpanded
        />

        {/* Footer
        <ContributionFooter contribution={contribution} post={post} />
         */}
      </div>
    </Card>
  );
}
