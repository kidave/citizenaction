"use client";

import { MessageSquarePlus, Share2 } from "lucide-react";

export default function ContributionFooter({
  contribution,
  post,
  onContribute,
  onShare,
}) {
  return (
    <div className="flex items-center justify-end border-t pt-3">
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onContribute?.();
          }}
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Contribute</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShare?.();
          }}
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
