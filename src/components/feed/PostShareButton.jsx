"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export default function PostShareButton({ post }) {
  const handleShare = async (e) => {
    e.stopPropagation();

    const url = `${window.location.origin}/post/${post.slug}`;
    const title = post.title || "Citizen Action Post";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      aria-label="Share post"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
