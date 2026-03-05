"use client";

import Timeline, {
  TimelineItem,
  TimelineItemDate,
  TimelineItemTitle,
  TimelineItemDescription
} from "@/components/ui/timeline";

export default function PostTimeline({ post }) {

  const history = post.metadata?.status_history || [];

  if (!history.length) return null;

  return (
    <div className="mt-4">

      {/* Desktop */}
      <div className="hidden md:block">

        <Timeline orientation="horizontal" noCards>

          {history.map((item, idx) => (

            <TimelineItem
              key={idx}
              variant="outline"
              hollow={idx !== history.length - 1}
              className="text-center p-1"
            >

              <TimelineItemDate>
                {new Date(item.at).toLocaleDateString()}
              </TimelineItemDate>

              <TimelineItemTitle>
                {item.status.replaceAll("_", " ")}
              </TimelineItemTitle>

              <TimelineItemDescription>
                {item.description}
              </TimelineItemDescription>

            </TimelineItem>

          ))}

        </Timeline>

      </div>

      {/* Mobile */}

      <div className="md:hidden">

        <Timeline orientation="vertical" noCards>

          {history.map((item, idx) => (

            <TimelineItem
              key={idx}
              variant="outline"
              hollow={idx !== history.length - 1}
            >

              <TimelineItemDate>
                {new Date(item.at).toLocaleDateString()}
              </TimelineItemDate>

              <TimelineItemTitle>
                {item.status.replaceAll("_", " ")}
              </TimelineItemTitle>

              <TimelineItemDescription>
                {item.description}
              </TimelineItemDescription>

            </TimelineItem>

          ))}

        </Timeline>

      </div>

    </div>
  );
}