import { getTimelineColorForMonth } from "@/config/timeline";

export default function TimelineFilters({
  months = [],
  activeMonth,
  onSelect,
  vertical = false,
}) {
  return (
    <div
      className={
        vertical ? "flex flex-col gap-2" : "flex gap-2 overflow-x-auto pb-1"
      }
    >
      {months.map((month) => {
        const color = getTimelineColorForMonth(month.key, months);

        const active = month.key === activeMonth;

        return (
          <button
            key={month.key}
            type="button"
            onClick={() => onSelect(month.key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
              active ? "text-foreground shadow-sm" : "text-muted-foreground"
            }`}
            style={{
              borderColor: active ? color.line : color.glow,
              background: active ? color.glow : "transparent",
            }}
          >
            {month.label}
          </button>
        );
      })}
    </div>
  );
}
