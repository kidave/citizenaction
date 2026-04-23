"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Stack } from "@/components/layout/Stack";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostMetadata from "./PostMetadata";
import PostTimeline from "./PostTimeline";
import PostAttachments from "./PostAttachments";
import PostFooter from "./PostFooter";

import PostMeeting from "@/components/feed/post-meeting/PostMeeting";

export default function PostCard({
  post,
  canEdit = false,
  onEdit,
  onDelete,
  forceExpanded = false,
}) {
  const router = useRouter();

  if (!post) return null;

  const handleNavigate = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );

    router.push(`/post/${post.id}`);
  };

  const typeStyles = {
    action: "sm:border-l-4 sm:border-red-500 bg-red-50/30",
    report: "sm:border-l-4 sm:border-blue-500 bg-blue-50/30",
    event: "sm:border-l-4 sm:border-green-500 bg-green-50/40",
    update: "sm:border-l-4 sm:border-pink-500 bg-pink-50/40",
    meeting: "sm:border-l-4 sm:border-yellow-500 bg-yellow-50/30",
  };

  return (
    <Card
      className={`
        cursor-pointer overflow-
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
          date={post.date}
          time={post.time}
          location={post.location}
          type={post.type}
          title={post.summary}
          description={post.details}
        />

        <PostTimeline post={post} />

        <PostAttachments attachments={post.attachments} />

        {post.type === "meeting" && post.meeting_attendees && forceExpanded && (
          <PostMeeting meeting={post} />
        )}

        <PostFooter post={post} />
      </Stack>
    </Card>
  );
}