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
import { usePostSpaces } from "@/hooks/feed/usePostSpaces";

import getPostStatus from "@/utils/feed/getPostStatus";

export default function PostCard({
  post,
  onEdit,
  onDelete,
  forceExpanded = false,
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

  const { data: permissions } = usePostPermissions(post?.id);

  const { data: spaces = [] } = usePostSpaces(post?.id);

  if (!post) return null;

  const canEdit = permissions?.can_manage || post.author_id === user?.id;

  const status = getPostStatus(post, mounted ? now : null);

  const handleNavigate = () => {
    sessionStorage.setItem("feed-scroll", window.scrollY.toString());

    router.push(`/post/${post.id}`);
  };

  const typeStyles = {
    action: "bg-gradient-to-br from-red-100 to-red-50",

    report: "bg-gradient-to-br from-blue-100 to-blue-50",

    event: "bg-gradient-to-br from-green-100 to-green-50",

    update: "bg-gradient-to-br from-pink-100 to-pink-50",

    meeting: "bg-gradient-to-br from-yellow-100 to-yellow-50",
  };

  return (
    <Card
      className={`relative overflow-hidden rounded-[28px] border-4 bg-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
        typeStyles[post.type] || ""
      } `}
    >
      {/* =====================================================
          FLOATING BACKGROUND SHAPES
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* PINK */}

        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-300/20 blur-3xl" />

        {/* BLUE */}

        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 p-4 sm:p-6">
        <Stack>
          {/* =====================================================
              HEADER
          ===================================================== */}

          <PostHeader
            post={{
              ...post,
              spaces,
            }}
            status={status}
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />

          {/* =====================================================
              MAIN CONTENT
          ===================================================== */}

          <div>
            <div
              className="cursor-pointer transition-opacity hover:opacity-90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigate();
              }}
            >
              {/* =====================================================
                  CONTENT WRAPPER
              ===================================================== */}

              <div className="mt-2 rounded-3xl border-2 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
                <PostContent
                  post={{
                    ...post,
                    spaces,
                  }}
                  status={status}
                  forceExpanded={forceExpanded}
                />

                <PostMetadata
                  post={{
                    ...post,
                    spaces,
                  }}
                  status={status}
                  forceExpanded={forceExpanded}
                />

                <PostTimeline
                  post={{
                    ...post,
                    spaces,
                  }}
                />
              </div>
            </div>

            {/* =====================================================
                ATTACHMENTS
            ===================================================== */}

            {post.attachments?.length > 0 && (
              <div className="mt-4">
                <div className="overflow-hidden rounded-3xl">
                  <PostAttachments attachments={post.attachments} />
                </div>
              </div>
            )}
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div className="rounded-3xl border-2 bg-white/70 p-2 backdrop-blur-sm">
            <PostFooter
              post={{
                ...post,
                spaces,
              }}
            />
          </div>

          {/* =====================================================
              MEETING
          ===================================================== */}

          {post.type === "meeting" && forceExpanded && (
            <div className="rounded-3xl border-2 bg-yellow-100/70 p-4 backdrop-blur-sm">
              <PostMeeting
                post={{
                  ...post,
                  spaces,
                }}
              />
            </div>
          )}
        </Stack>
      </div>
    </Card>
  );
}
