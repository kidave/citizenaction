"use client";

import { useState } from "react";
import Timeline, {
  TimelineItem,
  TimelineItemDate,
  TimelineItemTitle,
  TimelineItemDescription
} from "@/components/ui/timeline";
import FieldInfo from "@/components/ui/FieldInfo";
import formatPostDate from "@/utils/posts/formatPostDate";

export default function PostTimeline({ post }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const history = post?.timeline || [];

  if (!history.length) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.at) - new Date(b.at)
  );

  return (
    <div>

      {/* Desktop */}
      <div className="hidden md:block">
        <Timeline orientation="horizontal" noCards>
          

          {sorted.map((item, idx) => {
            const isLast = idx === sorted.length - 1;
            const isExpanded = expandedIndex === idx;

            let title = "";
            let description = item.description;

            /* authority response */
            if (item.type === "authority_response") {
              title = `Response from ${item.authority || "Authority"}`;
            }

            /* default status */
            else {
              title = item.title;
            }

            return (
              <TimelineItem
                key={`${item.at}-${idx}`}
                variant={item.variant || "outline"}
                hollow={!isLast}
                className="text-center"
                onDotClick={() =>
                  setExpandedIndex(expandedIndex === idx ?null : idx)
                }
              >

                <TimelineItemDate>
                  {formatPostDate(item.at, "absolute")}
                </TimelineItemDate>

                <TimelineItemTitle>
                  {title}
                </TimelineItemTitle>

                {description && (
                  <TimelineItemDescription
                    className={!isExpanded ? "line-clamp-2" : ""}
                  >
                    {item.description}
                  </TimelineItemDescription>
                )}

              </TimelineItem>
            );

          })}

        </Timeline>

      </div>

      {/* Mobile */}

      <div className="md:hidden overflow-hidden">
        <Timeline
          orientation="vertical"
          noCards
          alternating={false}
          alignment="after"
          vertItemMaxWidth={240}
          vertItemSpacing={90}
        >
          

          {sorted.map((item, idx) => {

            const isLast = idx === sorted.length - 1;
            const isExpanded = expandedIndex === idx;

            let title = "";
            let description = item.description;

            /* authority response */
            if (item.type === "authority_response") {
              title = `Response from ${item.authority || "Authority"}`;
            }

            /* default status */
            else {
              title = item.title;
            }

            return (
              <TimelineItem
                key={`${item.at}-${idx}`}
                variant={item.variant || "outline"}
                hollow={!isLast}
                className="break-words max-w-full"
                onDotClick={() =>
                  setExpandedIndex(isExpanded ? null : idx)
                }
              >
                <TimelineItemDate>
                  {formatPostDate(item.at, "absolute")}
                </TimelineItemDate>

                <TimelineItemTitle>
                  {title}
                </TimelineItemTitle>

                {item.description && (
                  <TimelineItemDescription
                    className={!isExpanded ? "line-clamp-3" : ""}
                  >
                    {item.description}
                  </TimelineItemDescription>
                )}

              </TimelineItem>
            );

          })}

        </Timeline>

      </div>

    </div>
  );
}