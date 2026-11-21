"use client";

import { format } from "date-fns";
import { getTimelineColor } from "@/config/timeline";

export default function TimelineMonthMarkers({ months = [], activeMonth, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {months.map((month, index) => {
        const color = getTimelineColor(month.year, index);
        const active = month.key === activeMonth;

        return (
          <button
            key={month.key}
            type="button"
            onClick={() => onSelect(month.key)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition"
            style={{
              borderColor: active ? color.line : "hsl(var(--border))",
              color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              background: active ? color.glow : "transparent",
            }}
          >
            {format(new Date(`${month.key}-01`), "MMM yyyy")}
          </button>
        );
      })}
    </div>
  );
}
