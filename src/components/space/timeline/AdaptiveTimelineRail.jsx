"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Monitor, Rows3, Columns3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { getTimelineColor, getTimelineColorForMonth } from "@/config/timeline";
import { TIMELINE_ORIENTATION, TIMELINE_BREAKPOINTS } from "@/config/timeline/orientation";
import TimelineCard from "@/components/space/timeline/TimelineCard";

function getPreferredOrientation(value, width) {
  if (value === TIMELINE_ORIENTATION.HORIZONTAL) return TIMELINE_ORIENTATION.HORIZONTAL;
  if (value === TIMELINE_ORIENTATION.VERTICAL) return TIMELINE_ORIENTATION.VERTICAL;
  return width < TIMELINE_BREAKPOINTS.verticalBelowPx
    ? TIMELINE_ORIENTATION.VERTICAL
    : TIMELINE_ORIENTATION.HORIZONTAL;
}

export default function AdaptiveTimelineRail({ events, monthMarkers, activeMonth, onMonthChange, onSelectEvent }) {
  const [preference, setPreference] = useState(TIMELINE_ORIENTATION.AUTO);
  const [width, setWidth] = useState(1440);
  const railRef = useRef(null);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const orientation = getPreferredOrientation(preference, width);

  const activeIndex = useMemo(
    () => Math.max(0, monthMarkers.findIndex((month) => month.key === activeMonth)),
    [monthMarkers, activeMonth],
  );

  const progress = monthMarkers.length ? ((activeIndex + 1) / monthMarkers.length) * 100 : 0;
  const activeColor = activeMonth
    ? getTimelineColorForMonth(activeMonth, monthMarkers)
    : getTimelineColor(0, 0);

  const handleScroll = () => {
    if (orientation !== TIMELINE_ORIENTATION.HORIZONTAL) return;
    const rail = railRef.current;
    if (!rail) return;
    const nodes = rail.querySelectorAll("[data-month]");
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let closest = null;
    let distance = Infinity;
    nodes.forEach((node) => {
      const nodeCenter = node.offsetLeft + node.offsetWidth / 2;
      const diff = Math.abs(nodeCenter - center);
      if (diff < distance) {
        distance = diff;
        closest = node.dataset.month;
      }
    });
    if (closest) onMonthChange(closest);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || orientation !== TIMELINE_ORIENTATION.HORIZONTAL) return undefined;

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 2) return;
      const atStart = rail.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1 && event.deltaY > 0;
      if (atStart || atEnd) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("scroll", handleScroll);
    };
  }, [orientation, monthMarkers.length]);

  const jumpHorizontal = (direction) => {
    railRef.current?.scrollBy({
      left: direction * Math.max(window.innerWidth * 0.72, 460),
      behavior: "smooth",
    });
  };

  const jumpToMonth = (monthKey) => {
    if (orientation === TIMELINE_ORIENTATION.HORIZONTAL) {
      railRef.current?.querySelector(`[data-month="${monthKey}"]`)?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      return;
    }

    document.querySelector(`[data-month="${monthKey}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    onMonthChange(monthKey);
  };

  const renderToggle = () => (
    <div className="flex items-center gap-1 rounded-full border bg-background/80 p-1 backdrop-blur">
      <Button
        type="button"
        variant={preference === TIMELINE_ORIENTATION.AUTO ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setPreference(TIMELINE_ORIENTATION.AUTO)}
        title="Automatic timeline layout"
      >
        <Monitor className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant={preference === TIMELINE_ORIENTATION.HORIZONTAL ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setPreference(TIMELINE_ORIENTATION.HORIZONTAL)}
        title="Horizontal timeline"
      >
        <Columns3 className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant={preference === TIMELINE_ORIENTATION.VERTICAL ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setPreference(TIMELINE_ORIENTATION.VERTICAL)}
        title="Vertical timeline"
      >
        <Rows3 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const monthFilter = (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {monthMarkers.map((month) => {
        const color = getTimelineColorForMonth(month.key, monthMarkers);
        const active = month.key === activeMonth;
        return (
          <button
            key={month.key}
            type="button"
            onClick={() => jumpToMonth(month.key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${active ? "text-foreground shadow-sm" : "text-muted-foreground"}`}
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

  if (orientation === TIMELINE_ORIENTATION.VERTICAL) {
    return (
      <section className="mx-auto w-full max-w-6xl pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Timeline layout</div>
          {renderToggle()}
        </div>

        <div className="relative md:pl-28">
          <aside className="mb-6 md:sticky md:top-24 md:float-left md:ml-[-7rem] md:w-24">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Months</div>
            <div className="mt-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-x-visible">{monthFilter}</div>
            </div>
          </aside>

          <div className="relative mx-auto max-w-5xl">
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />
            <div
              className="pointer-events-none absolute left-1/2 top-0 hidden w-px -translate-x-1/2 md:block"
              style={{
                height: `${progress}%`,
                background: activeColor.line,
                boxShadow: `0 0 14px ${activeColor.glow}`,
              }}
            />

            <div className="space-y-14 md:space-y-20">
              {events.map((event, index) => {
                const date = new Date(event.occurred_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                const monthIndex = monthMarkers.findIndex((month) => month.key === monthKey);
                const color = getTimelineColorForMonth(monthKey, monthMarkers);
                const active = activeMonth === monthKey;
                const above = index % 2 === 0;

                return (
                  <div key={event.event_id} className="relative grid items-center md:grid-cols-[1fr_96px_1fr] md:gap-0" data-month={monthKey}>
                    <div className={`${above ? "md:col-start-1 md:pr-10" : "md:col-start-3 md:pl-10"}`}>
                      <TimelineCard
                        event={event}
                        above={above}
                        active={active}
                        color={color}
                        onSelect={onSelectEvent}
                        orientation={TIMELINE_ORIENTATION.VERTICAL}
                        monthIndex={Math.max(monthIndex, 0)}
                      />
                    </div>

                    <div className="relative z-20 hidden min-h-[250px] md:flex md:items-center md:justify-center">
                      <div
                        className="absolute left-1/2 top-1/2 h-px w-12 -translate-y-1/2"
                        style={{ background: active ? color.line : "hsl(var(--border))" }}
                      />
                      <motion.div
                        className="relative h-3.5 w-3.5 rounded-full border-2 bg-background"
                        animate={{ scale: active ? 1.25 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderColor: active ? color.line : "hsl(var(--border))", boxShadow: active ? `0 0 16px ${color.glow}` : undefined }}
                      />
                    </div>

                    <div className="mt-3 md:hidden">
                      <div className="ml-4 h-8 w-px bg-border" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pb-16">
      <div className="mb-5 flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Timeline layout</div>
        <div className="flex items-center gap-2">
          {renderToggle()}
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => jumpHorizontal(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => jumpHorizontal(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={railRef} className="scrollbar-hide overflow-x-auto overflow-y-hidden px-[7vw] py-8 sm:px-[8vw]">
        <div className="relative mx-auto flex min-w-max items-center">
          <div className="pointer-events-none absolute left-0 right-0 top-[320px] z-0 h-[3px] rounded-full bg-muted/90" />
          <Progress value={progress} className="pointer-events-none absolute left-0 right-0 top-[320px] z-0">
            <ProgressTrack className="h-[3px] bg-transparent">
              <ProgressIndicator
                className="h-full transition-none"
                style={{ background: activeColor.line, boxShadow: `0 0 12px ${activeColor.glow}` }}
              />
            </ProgressTrack>
          </Progress>

          {events.map((event, index) => {
            const date = new Date(event.occurred_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const monthIndex = monthMarkers.findIndex((month) => month.key === monthKey);
            const color = getTimelineColorForMonth(monthKey, monthMarkers);
            const active = activeMonth === monthKey;
            const above = index % 2 === 0;

            return (
              <div key={event.event_id} data-month={monthKey} className="relative w-[430px] shrink-0 px-5">
                <div className="relative h-[700px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-[320px] z-[2] h-20 w-px -translate-x-1/2"
                    style={{
                      top: above ? "260px" : "320px",
                      background: active ? color.line : "hsl(var(--border))",
                      boxShadow: active ? `0 0 10px ${color.glow}` : undefined,
                    }}
                  />

                  <div className={`absolute left-1/2 w-[390px] -translate-x-1/2 ${above ? "bottom-[380px]" : "top-[360px]"}`}>
                    <TimelineCard
                      event={event}
                      above={above}
                      active={active}
                      color={color}
                      onSelect={onSelectEvent}
                      orientation={TIMELINE_ORIENTATION.HORIZONTAL}
                      monthIndex={Math.max(monthIndex, 0)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 px-5 sm:px-8 lg:px-12">{monthFilter}</div>
    </section>
  );
}
