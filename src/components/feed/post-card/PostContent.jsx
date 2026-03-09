"use client";

import { useState, useEffect } from "react";
import truncateContent from "@/utils/posts/truncateContent";

export default function PostContent({
  post,
  onNavigate,
  forceExpanded = false,
}) {
  const [expanded, setExpanded] = useState(forceExpanded);

  useEffect(() => {
    if (forceExpanded) {
      setExpanded(true);
    }
  }, [forceExpanded]);

  const content = post.details || post.summary || "";

  const { text: truncatedText, isLong } =
    truncateContent(content, 280);

  return (
    <div
      onClick={!forceExpanded ? onNavigate : undefined}
      role={!forceExpanded ? "link" : undefined}
      tabIndex={!forceExpanded ? 0 : undefined}
      onKeyDown={(e) => {
        if (!forceExpanded && e.key === "Enter") {
          onNavigate?.();
        }
      }}
      className={!forceExpanded ? "cursor-pointer" : ""}
    >
      <div className="text-sm whitespace-pre-wrap">

        {expanded || !isLong
          ? content
          : truncatedText}

        {!forceExpanded && isLong && (
          <span
            className="ml-2 text-primary font-medium hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? "Show less" : "Show more"}
          </span>
        )}

      </div>
    </div>
  );
}