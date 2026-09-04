"use client";

import { useState, useMemo } from "react";

import { useSpaceFeed } from "@/hooks/space/useSpaceFeed";

import ActivityPreviewCard from "@/components/feed/activity/ActivityPreviewCard";

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

const activityTypes = ["all", "action", "meeting", "report", "event", "update"];

export default function ActivityTab({ spaceId }) {
  const { data: feed = [], isLoading } = useSpaceFeed(spaceId);

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState(null);
  const [type, setType] = useState("all");

  /* =====================================================
     DATE HELPER
  ===================================================== */

  const getDate = (post) => {
    if (post.start_at) {
      return new Date(post.start_at);
    }

    if (post.date) {
      return new Date(post.date);
    }

    return new Date(post.created_at);
  };

  /* =====================================================
     YEARS
  ===================================================== */

  const years = useMemo(() => {
    const allYears = feed.map((post) => getDate(post).getFullYear());

    const uniqueYears = [...new Set(allYears)];

    if (!uniqueYears.includes(currentYear)) {
      uniqueYears.push(currentYear);
    }

    return uniqueYears.sort((a, b) => b - a);
  }, [feed, currentYear]);

  /* =====================================================
     FINAL FILTERING
  ===================================================== */

  const finalFeed = useMemo(() => {
    return feed
      .filter((post) => {
        const date = getDate(post);

        const matchYear = year ? date.getFullYear() === Number(year) : true;

        const matchMonth = month !== null ? date.getMonth() === month : true;

        const matchType = type === "all" ? true : post.type === type;

        return matchYear && matchMonth && matchType;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [feed, year, month, type]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MeetingSkeleton key={i} />
        ))}
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-4">
      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* FILTERS */}

        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="min-w-0 rounded-md border px-2 py-1.5 text-xs"
          >
            {activityTypes.map((t) => (
              <option key={t} value={t}>
                {t === "all"
                  ? "All Types"
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          {/* YEAR */}

          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setMonth(null);
            }}
            className="w-20 rounded-md border px-2 py-1.5 text-xs"
          >
            <option value="">Select Year</option>

            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>

          {/* MONTH */}

          <select
            value={month ?? ""}
            onChange={(e) => {
              const value = e.target.value;

              setMonth(value === "" ? null : Number(value));
            }}
            className="w-24 rounded-md border px-2 py-1.5 text-xs"
          >
            <option value="">Select Month</option>

            {months.map((monthName, index) => (
              <option key={index} value={index}>
                {monthName}
              </option>
            ))}
          </select>

          {/* CLEAR */}

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={() => {
              setMonth(null);
              setYear("");
              setType("all");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {!finalFeed.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No activity</CardTitle>

            <CardDescription>
              No activity found for selected filters.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {finalFeed.map((post) => (
            <ActivityPreviewCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
