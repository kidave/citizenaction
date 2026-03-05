"use client";

import { useState } from "react";
import truncateContent from "@/utils/posts/truncateContent";

export default function PostContent({
  post,
  onNavigate,
}) {
  const [expanded, setExpanded] = useState(false);

  const content = post.details || post.summary || "";

  const { text: truncatedText, isLong } =
    truncateContent(content, 280);

  return (
    <div
      onClick={onNavigate}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onNavigate();
      }}
      className="cursor-pointer"
    >
      <div className="text-sm whitespace-pre-wrap">

        {expanded || !isLong
          ? content
          : truncatedText}

        {isLong && (
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