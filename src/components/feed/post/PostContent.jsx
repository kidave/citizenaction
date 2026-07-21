"use client";

import { useState, useEffect } from "react";
import truncateContent from "@/utils/text/truncateContent";
import Linkify from "linkify-react";
import { Badge } from "@/components/ui/badge";
import { Row } from "@/components/layout/Row";

export default function PostContent({
  post,
  onNavigate,
  forceExpanded = false,
  showBadge = true,
}) {
  const [expanded, setExpanded] = useState(forceExpanded);

  useEffect(() => {
    if (forceExpanded) {
      setExpanded(true);
    }
  }, [forceExpanded]);

  const type = post.type || "action";
  const title = post.summary || "";
  const content = post.details || "";

  const typeStyles = {
    action: "bg-red-100 text-red-700 border-red-200",
    report: "bg-blue-100 text-blue-700 border-blue-200",
    event: "bg-green-100 text-green-700 border-green-200",
    update: "bg-pink-100 text-pink-700 border-pink-200",
    meeting: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

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
        <Row className="mb-2 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {showBadge && (
              <Badge
                variant="secondary"
                className={`shrink-0 text-xs ${typeStyles[type] || ""}`}
              >
                {type.toUpperCase()}
              </Badge>
            )}

            {title && <div className="font-medium">{title}</div>}
          </div>
        </Row>

        <Linkify
          options={{
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-600 hover:underline break-all",
            render: ({ attributes, content }) => (
              <a {...attributes} onClick={(e) => e.stopPropagation()}>
                {content}
              </a>
            ),
          }}
        >
          {expanded || !isLong ? content : truncatedText}
        </Linkify>

        {!forceExpanded && isLong && (
          <span
            className="ml-2 cursor-pointer font-medium text-primary hover:underline"
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
