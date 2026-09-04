"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import { useSpaces } from "@/hooks/space/useSpaces";
import { useSpaceFeed } from "@/hooks/space/useSpaceFeed";

import {
  filterTimelineEvents,
  getTimelineYears,
  getTimelineMonthMarkers,
  hasTimelineMonth,
} from "@/utils/timeline";

import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import SpaceTimeline from "@/components/space/timeline/SpaceTimeline";

export default function SpaceTimelinePage() {
  const router = useRouter();

  const { space: slug } = router.query;

  /* ==========================================================
     SPACE
  ========================================================== */

  const {
    data: space,
    isLoading: spaceLoading,
    error: spaceError,
  } = useSpaces({
    slug,
    enabled: !!slug,
  });

  /* ==========================================================
     DATA
  ========================================================== */

  const { data: activities = [], isLoading: feedLoading } = useSpaceFeed(
    space?.id,
  );

  /* ==========================================================
     PAGE STATE
  ========================================================== */

  const [filter, setFilter] = useState("all");
  const [activeMonth, setActiveMonth] = useState(null);

  /* ==========================================================
     DERIVED TIMELINE DATA
  ========================================================== */

  const filteredEvents = useMemo(
    () => filterTimelineEvents(activities, filter),
    [activities, filter],
  );

  const years = useMemo(
    () => getTimelineYears(filteredEvents),
    [filteredEvents],
  );

  const monthMarkers = useMemo(
    () => getTimelineMonthMarkers(filteredEvents),
    [filteredEvents],
  );

  /* ==========================================================
     STATE SYNC
  ========================================================== */

  useEffect(() => {
    if (activeMonth && !hasTimelineMonth(monthMarkers, activeMonth)) {
      setActiveMonth(null);
    }
  }, [activeMonth, monthMarkers]);

  /* ==========================================================
     HANDLERS
  ========================================================== */

  const handleFilterChange = (value) => {
    setFilter(value);
    setActiveMonth(null);
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (spaceLoading || feedLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeaderSkeleton />
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (spaceError || !space) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Space not found</h1>

          <p className="mt-2 text-muted-foreground">
            The requested Space does not exist.
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     COMPOSE
  ========================================================== */

  return (
    <SpaceTimeline
      space={space}
      events={filteredEvents}
      years={years}
      monthMarkers={monthMarkers}
      filter={filter}
      activeMonth={activeMonth}
      onFilterChange={handleFilterChange}
      onMonthChange={setActiveMonth}
    />
  );
}
