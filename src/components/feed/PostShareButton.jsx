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
      } catch (error) {
        // User cancelled the share dialog.
        if (error?.name === "AbortError") {
          return;
        }

        console.error("Native share failed", {
          message: error?.message,
          name: error?.name,
        });

        toast.error("Unable to share this post.");
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy post link", {
        message: error?.message,
        name: error?.name,
      });

      toast.error("Unable to copy the link.");
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
