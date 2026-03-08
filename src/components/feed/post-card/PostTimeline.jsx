"use client";

import Timeline, {
  TimelineItem,
  TimelineItemDate,
  TimelineItemTitle,
  TimelineItemDescription
} from "@/components/ui/timeline";

export default function PostTimeline({ post }) {

  const history = post?.timeline || [];

  if (!history.length) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.at) - new Date(b.at)
  );

  return (
    <div className="mt-4">

      {/* Desktop */}
      <div className="hidden md:block">

        <Timeline orientation="horizontal" noCards>

          {sorted.map((item, idx) => {

            const isLast = idx === sorted.length - 1;

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
                className="text-center p-1"
              >

                <TimelineItemDate>
                  {item?.at
                    ? new Date(item.at).toLocaleDateString()
                    : ""}
                </TimelineItemDate>

                <TimelineItemTitle>
                  {title}
                </TimelineItemTitle>

                {description && (
                  <TimelineItemDescription>
                    {description}
                  </TimelineItemDescription>
                )}

              </TimelineItem>
            );

          })}

        </Timeline>

      </div>

      {/* Mobile */}

      <div className="md:hidden">

        <Timeline orientation="vertical" noCards>

          {sorted.map((item, idx) => {

            const isLast = idx === sorted.length - 1;

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
              >

                <TimelineItemDate>
                  {item?.at
                    ? new Date(item.at).toLocaleDateString()
                    : ""}
                </TimelineItemDate>

                <TimelineItemTitle>
                  {title}
                </TimelineItemTitle>

                {item.description && (
                  <TimelineItemDescription>
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