"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import PostShareButton from "@/components/feed/PostShareButton";

export default function PostFooter({ post }) {
  return (
    <div className="flex items-center justify-between pt-2">

      <PostShareButton post={post} />

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          navigator.clipboard.writeText(
            `${window.location.origin}/post/${post.id}`
          )
        }
      >
        <Share2 className="w-4 h-4 mr-2" />
        Copy Link
      </Button>

    </div>
  );
}