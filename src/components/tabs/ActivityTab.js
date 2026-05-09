"use client";

import { useState, useMemo } from "react";

import { useFeed } from "@/hooks/feed/useFeed";
import { useMeetings } from "@/hooks/meeting/useMeetings";

import ActivityPreviewCard from "@/components/feed/post-activity/ActivityPreviewCard";
import MeetingPreviewCard from "@/components/feed/post-meeting/MeetingPreviewCard";
import MeetingSkeleton from "@/components/skeletons/MeetingSkeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const activityTypes = [
  "all",
  "action",
  "meeting",
  "report",
  "event",
  "update",
];

export default function ActivityTab({
  spaceId,
  defaultScopeType = null,
  defaultScopeId = null,
}) {
  const { data: feed = [], isLoading } = useFeed();

  const { data: meetings = [] } = useMeetings({
    enabled: true,
  });

  const meetingMap = useMemo(() => {
    return new Map(
      meetings.map((m) => [m.id, m])
    );
  }, [meetings]);

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState(null);

  const [type, setType] = useState("all");

  const [scopeType, setScopeType] =
    useState(defaultScopeType || "");

  const [scopeId, setScopeId] =
    useState(defaultScopeId || "");

  // BASE FILTER
  const filteredFeed = useMemo(() => {
    return feed.filter((f) => {
      return spaceId
        ? f.space_id === spaceId
        : true;
    });
  }, [feed, spaceId]);

  // DATE HELPER
  const getDate = (m) => {
    if (m.metadata_date)
      return new Date(m.metadata_date);

    if (m.date)
      return new Date(m.date);

    return new Date(m.created_at);
  };

  // YEARS
  const years = useMemo(() => {
    const allYears = filteredFeed.map((m) =>
      getDate(m).getFullYear()
    );

    const uniqueYears = [...new Set(allYears)];

    if (!uniqueYears.includes(currentYear)) {
      uniqueYears.push(currentYear);
    }

    return uniqueYears.sort((a, b) => b - a);
  }, [filteredFeed, currentYear]);

  // SCOPE TYPES
  const scopeTypes = useMemo(() => {
    return [
      ...new Set(
        filteredFeed
          .map((f) => f.scope_type)
          .filter(Boolean)
      ),
    ];
  }, [filteredFeed]);

  // SCOPE IDS
  const scopeIds = useMemo(() => {
    return [
      ...new Set(
        filteredFeed
          .filter((f) =>
            scopeType
              ? f.scope_type === scopeType
              : true
          )
          .map((f) => f.scope_id)
          .filter(Boolean)
      ),
    ];
  }, [filteredFeed, scopeType]);

  // FINAL FILTERING
  const finalFeed = useMemo(() => {
    return filteredFeed
      .filter((m) => {
        const d = getDate(m);

        const matchYear = year
          ? d.getFullYear() === Number(year)
          : true;

        const matchMonth =
          month !== null
            ? d.getMonth() === month
            : true;

        const matchType =
          type === "all"
            ? true
            : m.type === type;

        const matchScopeType =
          scopeType
            ? m.scope_type === scopeType
            : true;

        const matchScopeId =
          scopeId
            ? m.scope_id === scopeId
            : true;

        return (
          matchYear &&
          matchMonth &&
          matchType &&
          matchScopeType &&
          matchScopeId
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
  }, [
    filteredFeed,
    year,
    month,
    type,
    scopeType,
    scopeId,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map(
          (_, i) => (
            <MeetingSkeleton key={i} />
          )
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3">

        {/* TYPE */}
        <select
          value={activityTypes}
          onChange={(e) =>
            setSelectedType(
              e.target.value
            )
          }
          className="
            border
            rounded-md
            px-3
            py-2
            text-sm
            bg-background
          "
        >
            <option value="all">
              All Types
            </option>

            <option value="action">
              Action
            </option>

            <option value="meeting">
              Meeting
            </option>

            <option value="report">
              Report
            </option>

            <option value="event">
              Event
            </option>

            <option value="update">
              Update
          </option>
        </select>

        {/* YEAR */}
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setMonth(null);
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">
            Select Year
          </option>

          {years.map((y) => (
            <option
              key={y}
              value={String(y)}
            >
              {y}
            </option>
          ))}
        </select>

        {/* MONTH */}
        <select
          value={month ?? ""}
          onChange={(e) => {
            const val = e.target.value;

            setMonth(
              val === ""
                ? null
                : Number(val)
            );
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">
            Select Month
          </option>

          {months.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        {/* SCOPE TYPE */}
        <select
          value={scopeType}
          onChange={(e) => {
            setScopeType(e.target.value);
            setScopeId("");
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">
            Area
          </option>

          {scopeTypes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* CLEAR */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setMonth(null);
            setYear("");
            setType("all");
            setScopeType("");
            setScopeId("");
          }}
        >
          Clear
        </Button>
      </div>

      {/* CONTENT */}
      {!finalFeed.length ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>
              No activity
            </CardTitle>

            <CardDescription>
              No activity found for selected
              filters.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {finalFeed.map((post) => {

            if (post.type === "meeting") {
              const fullMeeting =
                meetingMap.get(post.id);

              return (
                <MeetingPreviewCard
                  key={post.id}
                  meeting={{
                    ...post,
                    attendees:
                      fullMeeting?.attendees ||
                      [],
                  }}
                />
              );
            }

            return (
              <ActivityPreviewCard
                key={post.id}
                post={post}
              />
            );
          })}

        </div>
      )}
    </div>
  );
}