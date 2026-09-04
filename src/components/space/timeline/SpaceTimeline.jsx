"use client";

import { motion } from "framer-motion";
import { History } from "lucide-react";

import { getTimelineColor, getTimelineColorForMonth } from "@/config/timeline";

import { TIMELINE_ORIENTATION } from "@/config/timeline/orientation";

import useSpaceTimeline from "@/hooks/space/useSpaceTimeline";

import BackButton from "@/components/ui/back-button";

import TimelineControls from "./TimelineControls";
import TimelineFilters from "./TimelineFilters";
import TimelineHorizontal from "./TimelineHorizontal";
import TimelineVertical from "./TimelineVertical";
import SpaceTimelineEmpty from "./SpaceTimelineEmpty";

export default function SpaceTimeline({
  space,
  events = [],
  years = [],
  monthMarkers = [],
  filter = "all",
  activeMonth,
  onMonthChange,
  onFilterChange,
  onSelectEvent,
}) {
  const {
    orientation,
    preference,
    setPreference,
    progress,
    railRef,
    timelineRef,
    jumpHorizontal,
    jumpToMonth,
  } = useSpaceTimeline({
    onMonthChange,
  });

  const posts = Array.isArray(events) ? events.filter(Boolean) : [];

  const activeColor = activeMonth
    ? getTimelineColorForMonth(activeMonth, monthMarkers)
    : getTimelineColor(0, 0);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [-80, 80, -80],
            y: [20, -30, 20],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-10%] top-[-5%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-[130px]"
        />

        <motion.div
          animate={{
            x: [70, -70, 70],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-10%] top-[20%] h-[460px] w-[460px] rounded-full bg-primary/5 blur-[120px]"
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="flex items-center gap-3 border-b border-border/70 px-4 py-3 sm:px-6 lg:px-8">
          <BackButton />

          <div className="min-w-0 flex-1">
            <div className="truncate">{space?.name}</div>
          </div>
        </header>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="flex min-h-0 flex-1 flex-col">
          {/* =================================================
              INTRO
          ================================================= */}

          <section className="mx-auto w-full max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pt-16 lg:px-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                Timeline
              </div>

              <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">
                {space?.name}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A visual record of the people, places and moments that shaped
                the {space?.name} team.
              </p>
            </div>

            {/* ===============================================
                YEARS + FILTERS
            =============================================== */}

            <div className="mt-8 flex flex-col gap-3">
              {/* YEARS */}

              {years.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {years.map((year) => (
                    <span
                      key={year}
                      className="shrink-0 rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-medium text-muted-foreground"
                    >
                      {year}
                    </span>
                  ))}
                </div>
              )}

              {/* FILTERS */}

              <TimelineFilters
                months={monthMarkers}
                activeMonth={activeMonth}
                onSelect={jumpToMonth}
              />
            </div>
          </section>

          {/* =================================================
              TIMELINE
          ================================================= */}

          {posts.length ? (
            <section className="relative pb-16">
              <TimelineControls
                preference={preference}
                onPreferenceChange={setPreference}
                onPrevious={() => jumpHorizontal(-1)}
                onNext={() => jumpHorizontal(1)}
                showNavigation={orientation === TIMELINE_ORIENTATION.HORIZONTAL}
              />

              {orientation === TIMELINE_ORIENTATION.HORIZONTAL ? (
                <TimelineHorizontal
                  events={posts}
                  monthMarkers={monthMarkers}
                  activeMonth={activeMonth}
                  onSelectEvent={onSelectEvent}
                  progress={progress}
                  color={activeColor}
                  railRef={railRef}
                />
              ) : (
                <TimelineVertical
                  events={posts}
                  monthMarkers={monthMarkers}
                  activeMonth={activeMonth}
                  onMonthChange={jumpToMonth}
                  onSelectEvent={onSelectEvent}
                  progress={progress}
                  color={activeColor}
                  timelineRef={timelineRef}
                />
              )}
            </section>
          ) : (
            <SpaceTimelineEmpty />
          )}
        </main>
      </div>
    </div>
  );
}
