import ActivityPreviewCard from "@/components/feed/activity/ActivityPreviewCard";

import { getTimelineColorForMonth } from "@/config/timeline";
import { getTimelineMonthKey } from "@/utils/timeline";

export default function TimelineEvent({
  post,
  index,
  monthMarkers,
  activeMonth,
  onSelectEvent,
  orientation,
}) {
  const monthKey = getTimelineMonthKey(post);

  if (!monthKey) {
    return null;
  }

  const month = monthMarkers.find((item) => item.key === monthKey);

  const color = getTimelineColorForMonth(monthKey, monthMarkers);

  const active = activeMonth === monthKey;

  const card = (
    <ActivityPreviewCard
      post={post}
      onSelect={onSelectEvent}
      className={active ? "ring-1" : ""}
    />
  );

  if (orientation === "horizontal") {
    return (
      <div
        data-month={monthKey}
        data-timeline-event
        className="relative flex w-[320px] shrink-0 flex-col"
      >
        <div className={index % 2 === 0 ? "mb-[340px]" : "mt-[140px]"}>
          {card}
        </div>
      </div>
    );
  }

  const cardOnLeft = index % 2 === 0;

  return (
    <div
      data-timeline-event
      data-month={monthKey}
      className="relative md:grid md:min-h-[300px] md:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] md:items-center"
    >
      <div className={cardOnLeft ? "md:col-start-1" : "md:col-start-3"}>
        <div
          className={`w-full max-w-[420px] ${cardOnLeft ? "" : "md:ml-auto"}`}
        >
          {card}
        </div>
      </div>

      <div className="relative hidden h-[300px] md:col-start-2 md:flex md:items-center md:justify-center">
        <div
          className="w-[120px] text-center text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{
            color: active ? color.line : "hsl(var(--muted-foreground))",
          }}
        >
          {month?.label}
        </div>
      </div>
    </div>
  );
}
