"use client";

import { useState, useEffect } from "react";
import truncateContent from "@/utils/text/truncateContent";
import Linkify from "linkify-react";

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

  const title = post.summary || "";
  const content = post.details || "";
  
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
      <div className="text-sm whitespace-pre-wrap space-y-1">
        {title && (
          <div className="font-medium mb-2">
            {title}
          </div>
        )}
        <Linkify
          options={{
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-600 hover:underline break-all",
            render: ({ attributes, content }) => (
              <a
                {...attributes}
                onClick={(e) => e.stopPropagation()}
              >
                {content}
              </a>
            ),
          }}
        >
          {expanded || !isLong ? content : truncatedText}
        </Linkify>

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