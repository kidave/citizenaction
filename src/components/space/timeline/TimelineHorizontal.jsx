import TimelineEvent from "./TimelineEvent";
import TimelineProgressRail from "./TimelineProgressRail";

export default function TimelineHorizontal({
  events = [],
  monthMarkers = [],
  activeMonth,
  onSelectEvent,
  progress,
  color,
  railRef,
}) {
  return (
    <div
      ref={railRef}
      className="scrollbar-hide overflow-x-auto overflow-y-hidden px-[7vw] py-8 sm:px-[8vw]"
    >
      <div className="relative mx-auto flex min-w-max items-center gap-16">
        <TimelineProgressRail
          progress={progress}
          color={color}
          orientation="horizontal"
        />

        {events.map((post, index) => (
          <TimelineEvent
            key={post.id}
            post={post}
            index={index}
            monthMarkers={monthMarkers}
            activeMonth={activeMonth}
            onSelectEvent={onSelectEvent}
            orientation="horizontal"
          />
        ))}
      </div>
    </div>
  );
}
