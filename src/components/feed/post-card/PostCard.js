"use client";

import { useEffect, useState } from "react";
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

import getPostStatus from "@/utils/feed/getPostStatus";

export default function PostCard({
  post,
  onEdit,
  onDelete,
  forceExpanded = false,
}) {
  const router = useRouter();

  const { user } = useAuth();

  // =====================================================
  // HOOKS
  // =====================================================

  const [mounted, setMounted] =
    useState(false);

  const [now, setNow] =
    useState(new Date());

  useEffect(() => {
    setMounted(true);

    const interval =
      setInterval(() => {
        setNow(new Date());
      }, 1000);

    return () =>
      clearInterval(interval);
  }, []);

  const { data: permissions } =
    usePostPermissions(post?.id);

  // =====================================================
  // GUARDS
  // =====================================================

  if (!post) return null;

  // =====================================================
  // PERMISSIONS
  // =====================================================

  const canEdit =
    permissions?.can_manage ||
    post.author_id === user?.id;

  // =====================================================
  // STATUS
  // =====================================================

  const status = getPostStatus(
    post,
    mounted
      ? new Date()
      : null
  );

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigate = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );

    router.push(
      `/post/${post.id}`
    );
  };

  // =====================================================
  // STYLES
  // =====================================================

  const typeStyles = {
    action: "bg-red-50",
    report: "bg-blue-50",
    event: "bg-green-50",
    update: "bg-pink-50",
    meeting: "bg-yellow-50",
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <Card
      className={`
        cursor-pointer overflow-hidden
        p-3 sm:p-5
        rounded-none sm:rounded-lg
        ${
          typeStyles[
            post.type
          ] || ""
        }
      `}
    >
      <Stack>

        <PostHeader
          post={post}
          status={status}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <PostContent
          post={post}
          status={status}
          onNavigate={
            handleNavigate
          }
          forceExpanded={
            forceExpanded
          }
        />

        <PostMetadata
          post={post}
          status={status}
          forceExpanded={
            forceExpanded
          }
        />

        <PostTimeline
          post={post}
        />

        <PostAttachments
          attachments={
            post.attachments
          }
        />

        <PostFooter
          post={post}
        />

        {post.type ===
          "meeting" &&
          forceExpanded && (
            <PostMeeting
              post={post}
            />
          )}

      </Stack>
    </Card>
  );
}