"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export default function PostShareButton({ postId, summary, details }) {
  const handleShare = async (e) => {
    e.stopPropagation();

    const url = `${window.location.origin}/post/${postId}`;
    const title = summary || "Citizen Action Post";
    const text = (details || "").slice(0, 120);

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
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
      className="gap-2 hover:bg-transparent transition"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}