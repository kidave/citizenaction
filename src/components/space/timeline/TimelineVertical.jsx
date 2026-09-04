import TimelineEvent from "./TimelineEvent";
import TimelineFilters from "./TimelineFilters";
import TimelineProgressRail from "./TimelineProgressRail";

export default function TimelineVertical({
  events = [],
  monthMarkers = [],
  activeMonth,
  onMonthChange,
  onSelectEvent,
  progress,
  color,
  timelineRef,
}) {
  return (
    <section
      ref={timelineRef}
      className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
    >
      <div className="relative py-2 md:pl-40">
        {/* MONTHS */}

        <aside className="md:sticky md:top-24 md:z-20 md:float-left md:ml-[-10rem] md:w-32">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Months
          </div>

          <div className="mt-3 max-h-[70vh] overflow-y-auto pr-1">
            <TimelineFilters
              months={monthMarkers}
              activeMonth={activeMonth}
              onSelect={onMonthChange}
              vertical
            />
          </div>
        </aside>

        {/* TIMELINE */}

        <div className="relative mx-auto max-w-5xl">
          <TimelineProgressRail
            progress={progress}
            color={color}
            orientation="vertical"
          />

          <div className="space-y-28 md:space-y-32">
            {events.map((post, index) => (
              <TimelineEvent
                key={post.id}
                post={post}
                index={index}
                monthMarkers={monthMarkers}
                activeMonth={activeMonth}
                onSelectEvent={onSelectEvent}
                orientation="vertical"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
