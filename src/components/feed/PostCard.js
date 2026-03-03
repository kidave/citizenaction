"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import AttachmentViewer from "@/components/ui/AttachmentViewer";
import { UserIdentity } from "@/components/profile/UserIdentity";
import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import PostMetadata from "./PostMetadata";
import PostShareButton from "./PostShareButton";
import MenuButton from "@/components/ui/MenuButton";
import Attachments from "@/components/ui/Attachments";
import Countdown from "@/components/ui/Countdown";

export default function PostCard({
  post,
  canEdit = false,
  onEdit,
  onDelete,
}) {
  const router = useRouter();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (!post) return null;

  const attachments = post.attachments || [];

  /* =========================
     CONTENT TRUNCATION
  ========================== */

  const content = post.details || post.summary || "";
  const isLong = content.length > 280;

  /* =========================
     NAVIGATION
  ========================== */

  const handleNavigate = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );

    router.push(`/post/${post.id}`);
  };


  return (
    <>
      <Card
        className="p-5 space-y-4 cursor-pointer transition-colors"
      >
        {post.type === "meeting" && (
          <Countdown
            date={post.metadata?.date}
            time={post.metadata?.time}
            thresholdHours={6}
            className="mb-2"
          />
        )}
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 justify-between">
            <UserIdentity
              username={post.author_username}
              name={post.author_name}
              avatar={post.author_avatar}
              createdAt={post.created_at}
            />

            <Badge
              variant="secondary"
              className="text-xs shrink-0 mt-2"
            >
              {post.type?.toUpperCase()}
            </Badge>

            
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:justify-start">
            <PostShareButton
              postId={post.id}
              summary={post.summary}
              details={post.details}
            />

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

          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div
          onClick={handleNavigate}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNavigate();
          }}
          className="cursor-pointer"
        >
          <div className="text-sm whitespace-pre-wrap">
            {expanded || !isLong
              ? content
              : content.slice(0, 280) + "..."}

            {isLong && (
              <span
                className="ml-2 text-primary font-medium hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? "Show less" : "Show more"}
              </span>
            )}
          </div>
        </div>

        <PostMetadata
          metadata={post.metadata}
          status={post.status}
          type={post.type}
          title={post.summary}
          description={post.details}
        />

        <Attachments attachments={attachments} />

      </Card>

      {/* ================= VIEWER ================= */}
      <AttachmentViewer
        attachments={attachments}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        activeIndex={activeIndex}
      />
    </>
  );
}