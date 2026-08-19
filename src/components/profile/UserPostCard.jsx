"use client";

import { useRouter } from "next/router";

import { Card } from "@/components/ui/card";

import AutoImageCarousel from "@/components/attachment/AutoImageCarousel";

export default function UserPostCard({ post }) {
  const router = useRouter();

  if (!post) {
    return null;
  }

  const hasAttachments =
    Array.isArray(post.attachments) && post.attachments.length > 0;

  const handleNavigate = () => {
    if (!post.slug) {
      return;
    }

    router.push(`/post/${post.slug}`);
  };

  return (
    <Card
      onClick={handleNavigate}
      className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-none border-0 bg-muted p-0 shadow-none"
    >
      {/* IMAGE */}

      <div className="absolute inset-0">
        {hasAttachments ? (
          <AutoImageCarousel attachments={post.attachments} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-4xl text-muted-foreground/30">+</span>
          </div>
        )}
      </div>

      {/* BOTTOM GRADIENT */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      {/* TITLE */}

      <div className="absolute inset-x-0 bottom-0 z-20 min-w-0 p-3 text-white">
        <p className="truncate text-sm font-semibold leading-tight">
          {post.title || "Untitled"}
        </p>
      </div>

      {/* HOVER */}

      <div className="pointer-events-none absolute inset-0 z-10 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
    </Card>
  );
}
