"use client";

import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

export default function PostCard({ post }) {
  if (!post) return null;

  return (
    <Card className="p-4 space-y-2">
      {/* HEADER */}
      <div className="flex gap-2 items-center">
        <Image
          src={post.profile?.avatar_url || "/user1.png"}
          className="h-8 w-8 rounded-full"
          width={32}
          height={32}
          alt={post.profile?.name || "User avatar"}
        />

        <div>
          <div className="font-medium">
            {post.profile?.name || "Anonymous"}
          </div>

          <div className="text-xs text-muted-foreground">
            {post.created_at
              ? `${formatDistanceToNow(new Date(post.created_at))} ago`
              : ""}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <p className="text-sm">
        {post.summary}
      </p>

      {/* ATTACHMENTS */}
      {Array.isArray(post.attachments) && post.attachments.length > 0 && (
        <div className="flex flex-col gap-1 pt-2">
          {post.attachments.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-sm underline"
            >
              {a.name || a.url}
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
