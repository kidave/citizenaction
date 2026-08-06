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

  const title = post.title || "";
  const content = post.content || "";

  const { text: truncatedText, isLong } = truncateContent(content, 280);

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
      <div className="space-y-1 whitespace-pre-wrap text-sm">
        <div className="mb-2 flex items-center gap-2">
          {title && <div className="font-medium">{title}</div>}
        </div>

        <Linkify
          options={{
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-info hover:underline break-all",
            render: ({ attributes, content }) => {
              const { class: className, ...rest } = attributes;

              return (
                <a
                  {...rest}
                  className={className}
                  onClick={(e) => e.stopPropagation()}
                >
                  {content}
                </a>
              );
            },
          }}
        >
          {expanded || !isLong ? content : truncatedText}
        </Linkify>

        {!forceExpanded && isLong && (
          <span
            className="ml-2 cursor-pointer font-medium hover:underline"
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
