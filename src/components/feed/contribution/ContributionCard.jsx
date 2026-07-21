"use client";

import { Card } from "@/components/ui/card";

import PostHeader from "@/components/feed/post/PostHeader";
import PostContent from "@/components/feed/post/PostContent";
import PostMetadata from "@/components/feed/post/PostMetadata";
import PostAttachments from "@/components/feed/post/PostAttachments";
import PostActions from "@/components/feed/post/PostActions";

export default function ContributionCard({
  contribution,
  post,
  canEdit,
  onEdit,
  onDelete,
}) {
  const contributionPost = {
    ...contribution,

    summary: contribution.summary ?? contribution.title,
    details: contribution.details ?? contribution.content,

    spaces: post.spaces ?? [],
    type: "contribution",
  };

  return (
    <Card className="rounded-3xl border-2 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="space-y-4">
        <PostHeader post={contributionPost} canEdit={false} status={null} />

        {canEdit && (
          <div className="flex justify-end">
            <PostActions canEdit onEdit={onEdit} onDelete={onDelete} />
          </div>
        )}

        {contribution.attachments?.length > 0 && (
          <div className="overflow-hidden rounded-3xl">
            <PostAttachments attachments={contribution.attachments} />
          </div>
        )}

        <div className="rounded-3xl border-2 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
          <PostContent post={contributionPost} forceExpanded />

          <PostMetadata post={contributionPost} forceExpanded />
        </div>
      </div>
    </Card>
  );
}
