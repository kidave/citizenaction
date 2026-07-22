"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import { Card } from "@/components/ui/card";

import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostMetadata from "./PostMetadata";
import PostTimeline from "./PostTimeline";
import PostAttachments from "./PostAttachments";
import PostFooter from "./PostFooter";

import PostContribution from "@/components/feed/contribution/PostContribution";

import { usePostPermissions } from "@/hooks/feed/usePostPermissions";
import { usePostSpaces } from "@/hooks/feed/usePostSpaces";

import getPostStatus from "@/utils/feed/getPostStatus";

export default function PostCard({
  post,
  onEdit,
  onDelete,
  forceExpanded = false,
  borderless = false,
  edgeToEdgeMobile = false,
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

  return (
    <Card
      className={`relative overflow-hidden bg-muted transition-all duration-300 ${edgeToEdgeMobile ? "rounded-none sm:rounded-[28px]" : "rounded-[28px]"} ${borderless ? "border-0 shadow-none" : ""} ${post.type || ""} `}
    >
      <div className="relative z-10 flex flex-col gap-2 p-4 sm:p-6">
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

        {post.attachments?.length > 0 && (
          <div className="overflow-hidden rounded-3xl">
            <PostAttachments attachments={post.attachments} />
          </div>
        )}

        <div>
          <div
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavigate();
            }}
          >
            <div className="rounded-3xl border-2 bg-background p-4 shadow-sm backdrop-blur-sm">
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
        </div>

        <div className="rounded-3xl border-2 bg-background p-2 backdrop-blur-sm">
          <PostFooter
            post={{
              ...post,
              spaces,
            }}
          />
        </div>

        {forceExpanded && (
          <PostContribution
            post={{
              ...post,
              spaces,
            }}
          />
        )}
      </div>
    </Card>
  );
}
