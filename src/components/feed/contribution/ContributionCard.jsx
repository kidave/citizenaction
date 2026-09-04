"use client";

import { UserIdentity } from "@/components/profile/UserIdentity";
import formatDate from "@/utils/date/formatDate";
import PostActions from "@/components/feed/post/PostActions";

import PostContent from "@/components/feed/post/PostContent";
import PostMetadata from "@/components/feed/post/PostMetadata";
import PostAttachments from "@/components/feed/post/PostAttachments";

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
    <div className="flex flex-col gap-2 sm:rounded-3xl sm:bg-muted sm:p-4">
      {/* Header */}

      <div className="flex items-start justify-between gap-3">
        <UserIdentity
          username={contribution.author_username}
          name={contribution.author_name}
          avatar={contribution.author_avatar}
          createdAt={formattedDate}
        />

        {canEdit && <PostActions canEdit onEdit={onEdit} onDelete={onDelete} />}
      </div>

      {/* Attachments */}

      {contribution.attachments?.length > 0 && (
        <div className="overflow-hidden rounded-none md:rounded-2xl">
          <PostAttachments attachments={contribution.attachments} />
        </div>
      )}

      {/* Content */}

      <PostContent
        post={{
          ...contribution,
          title: contribution.title,
          content: contribution.content,
          type: "contribution",
        }}
        forceExpanded
        showBadge={false}
      />

      {/* Metadata */}

      <PostMetadata
        post={{
          ...contribution,
          type: "contribution",
        }}
        forceExpanded
      />
    </div>
  );
}
