"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import { useAuth } from "@/context/AuthContext";

import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostMetadata from "./PostMetadata";
import PostTimeline from "./PostTimeline";
import PostAttachments from "./PostAttachments";
import PostLinks from "./PostLinks";
import PostFooter from "./PostFooter";
import PostContribution from "@/components/feed/contribution/PostContribution";
import getPostStatus from "@/utils/feed/getPostStatus";

export default function PostCard({
  post,
  onEdit,
  onDelete,
  profileMode,
  forceExpanded = false,
  borderless = false,
  edgeToEdgeMobile = false,
  loading = false,
  queryKey,
}) {
  const router = useRouter();

  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <PostCardSkeleton
        borderless={borderless}
        edgeToEdgeMobile={edgeToEdgeMobile}
        forceExpanded={forceExpanded}
        hasAttachments={post?.attachments?.length > 0}
      />
    );
  }

  if (!post) return null;

  const canEdit = post.permissions?.can_manage || post.author_id === user?.id;

  const status = getPostStatus(post, mounted ? now : null);

  const handleNavigate = () => {
    sessionStorage.setItem("feed-scroll", window.scrollY.toString());

    router.push(`/post/${post.slug}`);
  };

  return (
    <div
      className={`relative overflow-hidden border-b p-2 transition-all duration-300 ${borderless ? "border-0 shadow-none" : ""} ${post.type || ""} `}
    >
      <div className="relative z-10 flex flex-col gap-4 p-2">
        <PostHeader
          post={post}
          status={status}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
          profileMode={profileMode}
        />

        {post.attachments?.length > 0 && (
          <div className="overflow-hidden rounded-3xl">
            <PostAttachments attachments={post.attachments} />
          </div>
        )}

        <div
          className={
            !forceExpanded
              ? "cursor-pointer transition-opacity hover:opacity-90"
              : "transition-opacity"
          }
          onClick={
            !forceExpanded
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNavigate();
                }
              : undefined
          }
        >
          <div className="sm:rounded-3xl sm:bg-muted sm:p-4">
            <PostContent
              post={post}
              onNavigate={handleNavigate}
              forceExpanded={forceExpanded}
            />

            <PostMetadata
              post={post}
              status={status}
              forceExpanded={forceExpanded}
            />

            <PostTimeline post={post} />
          </div>
        </div>

        {/* LINKS */}
        {post.links?.length > 0 &&
          (forceExpanded || !post.attachments?.length) && (
            <div className="overflow-hidden">
              <PostLinks links={post.links} />
            </div>
          )}

        {/* FOOTER */}
        {!profileMode && (
          <div className="sm:rounded-3xl">
            <PostFooter
              post={post}
              forceExpanded={forceExpanded}
              queryKey={["feed"]}
            />
          </div>
        )}

        {/* CONTRIBUTION */}
        {!profileMode && forceExpanded && (
          <PostContribution post={post} queryKey={["feed"]} />
        )}
      </div>
    </div>
  );
}
