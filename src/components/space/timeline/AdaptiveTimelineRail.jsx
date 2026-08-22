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

  const handleHorizontalScroll = () => {
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

  const scrollToActiveVerticalMonth = () => {
    if (orientation !== TIMELINE_ORIENTATION.VERTICAL) return;
    const nodes = document.querySelectorAll("[data-month]");
    const readingLine = window.innerHeight * 0.42;
    let closest = null;
    let distance = Infinity;
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const nodeCenter = rect.top + rect.height / 2;
      const diff = Math.abs(nodeCenter - readingLine);
      if (diff < distance) {
        distance = diff;
        closest = node.dataset.month;
      }
    });
    if (closest) onMonthChange(closest);
  };

  useEffect(() => {
    if (orientation !== TIMELINE_ORIENTATION.VERTICAL) return undefined;
    const onScroll = () => scrollToActiveVerticalMonth();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const frame = window.requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [orientation, events.length, monthMarkers.length]);

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
    rail.addEventListener("scroll", handleHorizontalScroll, { passive: true });
    handleHorizontalScroll();
    return () => {
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("scroll", handleHorizontalScroll);
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

    const target = document.querySelector(`[data-month="${monthKey}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    onMonthChange(monthKey);
  };

  const renderToggle = () => (
    <div className="flex items-center gap-1 rounded-full border bg-background/80 p-1 backdrop-blur">
      <Button type="button" variant={preference === TIMELINE_ORIENTATION.AUTO ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-full" onClick={() => setPreference(TIMELINE_ORIENTATION.AUTO)} title="Automatic timeline layout">
        <Monitor className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant={preference === TIMELINE_ORIENTATION.HORIZONTAL ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-full" onClick={() => setPreference(TIMELINE_ORIENTATION.HORIZONTAL)} title="Horizontal timeline">
        <Columns3 className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant={preference === TIMELINE_ORIENTATION.VERTICAL ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-full" onClick={() => setPreference(TIMELINE_ORIENTATION.VERTICAL)} title="Vertical timeline">
        <Rows3 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const monthFilter = (vertical = false) => (
    <div className={vertical ? "flex flex-col gap-2" : "flex gap-2 overflow-x-auto pb-1"}>
      {monthMarkers.map((month) => {
        const color = getTimelineColorForMonth(month.key, monthMarkers);
        const active = month.key === activeMonth;
        return (
          <button
            key={month.key}
            type="button"
            onClick={() => jumpToMonth(month.key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${active ? "text-foreground shadow-sm" : "text-muted-foreground"}`}
            style={{ borderColor: active ? color.line : color.glow, background: active ? color.glow : "transparent" }}
          >
            {month.label}
          </button>
        );
      })}
    </div>
  );

  if (orientation === TIMELINE_ORIENTATION.VERTICAL) {
    return (
      <section className="mx-auto w-full max-w-7xl pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Timeline layout</div>
          {renderToggle()}
        </div>

        <div className="relative md:pl-44">
          <aside className="md:sticky md:top-24 md:z-20 md:float-left md:ml-[-11rem] md:w-36">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Months</div>
            <div className="mt-3 max-h-[70vh] overflow-y-auto pr-1">{monthFilter(true)}</div>
          </aside>

          <div className="relative mx-auto max-w-5xl">
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />
            <div
              className="pointer-events-none absolute left-1/2 top-0 hidden w-px -translate-x-1/2 md:block"
              style={{ height: `${progress}%`, background: activeColor.line, boxShadow: `0 0 14px ${activeColor.glow}` }}
            />

            <div className="space-y-28 md:space-y-32">
              {events.map((event, index) => {
                const date = new Date(event.occurred_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                const monthIndex = monthMarkers.findIndex((month) => month.key === monthKey);
                const color = getTimelineColorForMonth(monthKey, monthMarkers);
                const active = activeMonth === monthKey;
                const left = index % 2 === 0;
                const monthLabel = monthMarkers[monthIndex]?.label;

                return (
                  <div key={event.event_id} data-month={monthKey} className="relative min-h-[300px] md:grid md:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] md:items-center">
                    <div className={left ? "md:col-start-1 md:pr-14" : "md:col-start-3 md:pl-14"}>
                      <TimelineCard
                        event={event}
                        active={active}
                        color={color}
                        onSelect={onSelectEvent}
                        orientation={TIMELINE_ORIENTATION.VERTICAL}
                        monthIndex={Math.max(monthIndex, 0)}
                      />
                    </div>

                    <div className="relative hidden min-h-[300px] md:col-start-2 md:block">
                      <div className="absolute left-1/2 top-1/2 h-px w-40 -translate-y-1/2" style={{ background: "transparent" }} />

                      <div
                        className={`absolute top-1/2 -translate-y-1/2 ${left ? "right-0" : "left-0"}`}
                        style={{ color: active ? color.line : "hsl(var(--muted-foreground))" }}
                      >
                        <div className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em]">{monthLabel}</div>
                      </div>

                      <div
                        className={`absolute top-1/2 h-px -translate-y-1/2 ${left ? "right-[72px] left-0" : "left-[72px] right-0"}`}
                        style={{ background: active ? color.line : "hsl(var(--border))", boxShadow: active ? `0 0 8px ${color.glow}` : undefined }}
                      />

                      <motion.div
                        className="absolute left-1/2 top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background"
                        animate={{ scale: active ? 1.2 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderColor: active ? color.line : "hsl(var(--border))", boxShadow: active ? `0 0 16px ${color.glow}` : undefined }}
                      />
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
        <div className="flex items-center gap-2">{renderToggle()}<Button variant="outline" size="icon" className="rounded-full" onClick={() => jumpHorizontal(-1)}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="rounded-full" onClick={() => jumpHorizontal(1)}><ChevronRight className="h-4 w-4" /></Button></div>
      </div>

      <div ref={railRef} className="scrollbar-hide overflow-x-auto overflow-y-hidden px-[7vw] py-8 sm:px-[8vw]">
        <div className="relative mx-auto flex min-w-max items-center">
          <div className="pointer-events-none absolute left-0 right-0 top-[340px] z-0 h-[3px] rounded-full bg-muted/90" />
          <Progress value={progress} className="pointer-events-none absolute left-0 right-0 top-[340px] z-0">
            <ProgressTrack className="h-[3px] bg-transparent"><ProgressIndicator className="h-full transition-none" style={{ background: activeColor.line, boxShadow: `0 0 12px ${activeColor.glow}` }} /></ProgressTrack>
          </Progress>

          {events.map((event, index) => {
            const date = new Date(event.occurred_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const monthIndex = monthMarkers.findIndex((month) => month.key === monthKey);
            const color = getTimelineColorForMonth(monthKey, monthMarkers);
            const active = activeMonth === monthKey;
            const above = index % 2 === 0;
            const monthLabel = monthMarkers[monthIndex]?.label;

            return (
              <div key={event.event_id} data-month={monthKey} className="relative w-[460px] shrink-0 px-5">
                <div className="relative h-[720px]">
                  <div className={`absolute left-1/2 z-10 w-[390px] -translate-x-1/2 ${above ? "bottom-[390px]" : "top-[390px]"}`}>
                    <div className={`relative ${above ? "pb-12" : "pt-12"}`}>
                      <div className={`absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] ${above ? "bottom-2" : "top-2"}`} style={{ color: active ? color.line : "hsl(var(--muted-foreground))" }}>
                        {monthLabel}
                      </div>
                      <TimelineCard event={event} active={active} color={color} onSelect={onSelectEvent} orientation={TIMELINE_ORIENTATION.HORIZONTAL} monthIndex={Math.max(monthIndex, 0)} />
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-[340px] z-20 h-px w-16 -translate-x-1/2" style={{ background: active ? color.line : "hsl(var(--border))", boxShadow: active ? `0 0 8px ${color.glow}` : undefined }} />
                  <div className="absolute left-1/2 top-[340px] z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background" style={{ borderColor: active ? color.line : "hsl(var(--border))", boxShadow: active ? `0 0 16px ${color.glow}` : undefined }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 px-5 sm:px-8 lg:px-12">{monthFilter(false)}</div>
    </section>
  );
}
