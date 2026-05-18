"use client";

import { useState, useMemo } from "react";

import { useFeed } from "@/hooks/feed/useFeed";

import ActivityPreviewCard from "@/components/feed/post-activity/ActivityPreviewCard";

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
}) {
  const {
    data: feed = [],
    isLoading,
  } = useFeed();

  const currentYear =
    new Date().getFullYear();

  const [year, setYear] =
    useState("");

  const [month, setMonth] =
    useState(null);

  const [type, setType] =
    useState("all");

  /* =====================================================
     BASE FILTER
  ===================================================== */

  const filteredFeed = useMemo(() => {
    return feed.filter((f) => {
      return spaceId
        ? f.space_id === spaceId
        : true;
    });
  }, [feed, spaceId]);

  /* =====================================================
     DATE HELPER
  ===================================================== */

  const getDate = (m) => {
    if (m.start_at)
      return new Date(m.start_at);

    if (m.date)
      return new Date(m.date);

    return new Date(m.created_at);
  };

  /* =====================================================
     YEARS
  ===================================================== */

  const years = useMemo(() => {
    const allYears =
      filteredFeed.map((m) =>
        getDate(m).getFullYear()
      );

    const uniqueYears = [
      ...new Set(allYears),
    ];

    if (
      !uniqueYears.includes(
        currentYear
      )
    ) {
      uniqueYears.push(currentYear);
    }

    return uniqueYears.sort(
      (a, b) => b - a
    );
  }, [filteredFeed, currentYear]);

  /* =====================================================
     FINAL FILTERING
  ===================================================== */

  const finalFeed = useMemo(() => {
    return filteredFeed
      .filter((m) => {
        const d = getDate(m);

        const matchYear = year
          ? d.getFullYear() ===
            Number(year)
          : true;

        const matchMonth =
          month !== null
            ? d.getMonth() === month
            : true;

        const matchType =
          type === "all"
            ? true
            : m.type === type;

        return (
          matchYear &&
          matchMonth &&
          matchType
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
  ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({
          length: 3,
        }).map((_, i) => (
          <MeetingSkeleton key={i} />
        ))}
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="flex flex-wrap items-center gap-3">

        {/* TYPE */}

        <select
          value={type}
          onChange={(e) =>
            setType(
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

          {activityTypes.map((t) => (
            <option
              key={t}
              value={t}
            >
              {t === "all"
                ? "All Types"
                : t
                    .charAt(0)
                    .toUpperCase() +
                  t.slice(1)}
            </option>
          ))}

        </select>

        {/* YEAR */}

        <select
          value={year}
          onChange={(e) => {
            setYear(
              e.target.value
            );

            setMonth(null);
          }}
          className="
            border
            rounded-md
            px-3
            py-2
            text-sm
          "
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
            const val =
              e.target.value;

            setMonth(
              val === ""
                ? null
                : Number(val)
            );
          }}
          className="
            border
            rounded-md
            px-3
            py-2
            text-sm
          "
        >

          <option value="">
            Select Month
          </option>

          {months.map((m, i) => (
            <option
              key={i}
              value={i}
            >
              {m}
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

          }}
        >
          Clear
        </Button>

      </div>

      {/* =====================================================
          LEGEND
      ===================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-x-4
          gap-y-2

          text-xs
          text-muted-foreground

          px-1
        "
      >

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500"></span>

          <span>Action</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500"></span>

          <span>Report</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500"></span>

          <span>Event</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-pink-500"></span>

          <span>Update</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-yellow-500"></span>

          <span>Meeting</span>
        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {!finalFeed.length ? (
        <Card className="border-dashed">

          <CardHeader>

            <CardTitle>
              No activity
            </CardTitle>

            <CardDescription>
              No activity found for
              selected filters.
            </CardDescription>

          </CardHeader>

        </Card>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
          "
        >

          {finalFeed.map((post) => (
            <ActivityPreviewCard
              key={post.id}
              post={post}
            />
          ))}

        </div>
      )}

    </div>
  );
}