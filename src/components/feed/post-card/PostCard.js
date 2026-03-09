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

  return (
    <Card className="p-5 cursor-pointer transition-colors">
      <Stack gap="gap-4">
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

        <PostFooter post={post} />
      </Stack>
    </Card>
  );
}