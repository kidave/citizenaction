"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export default function PostShareButton({ post }) {
  const handleShare = async (e) => {
    e.stopPropagation();

    const url = `${window.location.origin}/post/${post.id}`;
    const title = post.summary || "Citizen Action Post";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
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
      size="sm"
      onClick={handleShare}
      className="transition hover:bg-transparent"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
