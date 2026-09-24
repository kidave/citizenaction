"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import { useSpaces } from "@/hooks/space/useSpaces";
import { useSpaceFeed } from "@/hooks/space/useSpaceFeed";
import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";

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

  const {
    data: space,
    isLoading: spaceLoading,
    error: spaceError,
  } = useSpaces({
    slug,
    enabled: !!slug,
  });

  const { data: activities = [], isLoading: feedLoading } = useSpaceFeed(
    space?.id,
  );

  const { data: members = [], isLoading: membersLoading } = useSpaceMembers({
    spaceId: space?.id,
  });

  const [filter, setFilter] = useState("all");
  const [activeMonth, setActiveMonth] = useState(null);

  const timelineEvents = useMemo(() => {
    const memberEvents = members.map((member) => ({
      id: `member-${space?.id}-${member.user_id}`,
      type: "member_joined",
      created_at: member.created_at,
      title: `${member.name || "A new member"} joined`,
      content: member.membership_message || "A new member joined this Space.",
      member,
    }));

    return [...activities, ...memberEvents];
  }, [activities, members, space?.id]);

  const filteredEvents = useMemo(
    () => filterTimelineEvents(timelineEvents, filter),
    [timelineEvents, filter],
  );

  const years = useMemo(
    () => getTimelineYears(filteredEvents),
    [filteredEvents],
  );

  const monthMarkers = useMemo(
    () => getTimelineMonthMarkers(filteredEvents),
    [filteredEvents],
  );

  useEffect(() => {
    if (activeMonth && !hasTimelineMonth(monthMarkers, activeMonth)) {
      setActiveMonth(null);
    }
  }, [activeMonth, monthMarkers]);

  const handleFilterChange = (value) => {
    setFilter(value);
    setActiveMonth(null);
  };

  if (spaceLoading || feedLoading || membersLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeaderSkeleton />
      </div>
    );
  }

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

SpaceTimelinePage.getLayout = (page) => page;
