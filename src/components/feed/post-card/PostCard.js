// components/feed/post-card/PostCard.js

"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Stack } from "@/components/layout/Stack";

import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostMetadata from "./PostMetadata";
import PostTimeline from "./PostTimeline";
import PostAttachments from "./PostAttachments";
import PostFooter from "./PostFooter";

import PostMeeting from "@/components/feed/post-meeting/PostMeeting";

import { usePostPermissions } from "@/hooks/feed/usePostPermissions";

export default function PostCard({
  post,
  onEdit,
  onDelete,
  forceExpanded = false,
}) {
  const router = useRouter();
  const { user } = useAuth();

  const { data: permissions } = usePostPermissions(post?.id);

  if (!post) return null;

  const canEdit =
    permissions?.can_manage || post.author_id === user?.id;

  const handleNavigate = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );

    router.push(`/post/${post.id}`);
  };

  const typeStyles = {
    action: "bg-red-50",
    report: "bg-blue-50",
    event: "bg-green-50",
    update: "bg-pink-50",
    meeting: "bg-yellow-50",
  };

  return (
    <Card
      className={`
        cursor-pointer overflow-hidden
        p-3 sm:p-5
        rounded-none sm:rounded-lg
        ${typeStyles[post.type] || ""}
      `}
    >
      <Stack>

        <PostHeader
          post={post}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <PostContent
          post={post}
          onNavigate={handleNavigate}
          forceExpanded={forceExpanded}
        />

        <PostMetadata
          post={post}
          forceExpanded={forceExpanded}
        />

        <PostTimeline post={post} />

        <PostAttachments attachments={post.attachments} />

        <PostFooter post={post} />

        {post.type === "meeting" && forceExpanded && (
          <PostMeeting post={post} />
        )}

      </Stack>
    </Card>
  );
}