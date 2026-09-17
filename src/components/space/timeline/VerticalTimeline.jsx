"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";

import TimelineCard from "./TimelineCard";
import { getTimelineColor } from "@/config/timeline";

export default function VerticalTimeline({ events = [], monthMarkers = [], activeMonth, onSelect }) {
  const monthIndexByKey = new Map(monthMarkers.map((month, index) => [month.key, index]));

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8 lg:px-12">
      <div className="relative">
        <div className="absolute bottom-0 left-1/2 top-0 hidden w-1 -translate-x-1/2 overflow-hidden rounded-full bg-muted/80 md:block" />

        {events.map((event, index) => {
          const date = new Date(event.occurred_at);
          const monthKey = format(date, "yyyy-MM");
          const monthIndex = monthIndexByKey.get(monthKey) ?? 0;
          const color = getTimelineColor(date.getFullYear(), monthIndex);
          const active = activeMonth === monthKey;
          const left = index % 2 === 0;

          return (
            <div key={event.event_id} data-month={monthKey} data-year={date.getFullYear()} className="relative grid min-h-[430px] items-center md:grid-cols-[1fr_96px_1fr]">
              <div className={`relative flex ${left ? "justify-end md:pr-10" : "justify-end md:col-start-3 md:row-start-1 md:pl-10"}`}>
                <TimelineCard
                  event={event}
                  above={left}
                  active={active}
                  onSelect={onSelect}
                  monthIndex={monthIndex}
                  vertical
                />
              </div>

              <div className="relative z-20 row-start-1 hidden h-full md:block">
                <div className="absolute left-1/2 top-1/2 h-[100px] w-px -translate-x-1/2 -translate-y-1/2" style={{ background: `linear-gradient(${left ? "to top" : "to bottom"}, transparent, ${active ? color.line : "hsl(var(--border))"})` }} />
                <motion.div
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
                  animate={{ scale: active ? 1.3 : 1, boxShadow: active ? `0 0 0 5px ${color.glow}` : "0 0 0 0 transparent" }}
                  transition={{ duration: 0.25 }}
                  style={{ background: active ? color.line : "hsl(var(--muted-foreground))" }}
                />
              </div>

              <div className="row-start-1 hidden md:block">
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border bg-background/90 px-3 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur ${active ? "text-foreground" : "text-muted-foreground"}`} style={{ borderColor: active ? color.line : "hsl(var(--border))" }}>
                  {format(date, "MMM yyyy")}
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 h-px hidden w-[calc(50%-48px)] -translate-y-1/2 md:block" style={{ background: active ? color.line : "hsl(var(--border))" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
