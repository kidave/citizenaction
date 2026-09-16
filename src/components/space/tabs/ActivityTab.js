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

export default function ActivityTab({ spaceId }) {
  const { data: feed = [], isLoading } = useSpaceFeed(spaceId);

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState(null);

  const getDate = (post) => {
    if (post.start_at) {
      return new Date(post.start_at);
    }

    if (post.date) {
      return new Date(post.date);
    }

    return new Date(post.created_at);
  };

  const years = useMemo(() => {
    const allYears = feed.map((post) => getDate(post).getFullYear());
    const uniqueYears = [...new Set(allYears)];

    if (!uniqueYears.includes(currentYear)) {
      uniqueYears.push(currentYear);
    }

    return uniqueYears.sort((a, b) => b - a);
  }, [feed, currentYear]);

  const finalFeed = useMemo(() => {
    return feed
      .filter((post) => {
        const date = getDate(post);
        const matchYear = year ? date.getFullYear() === Number(year) : true;
        const matchMonth = month !== null ? date.getMonth() === month : true;

        return matchYear && matchMonth;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [feed, year, month]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MeetingSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto">
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

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={() => {
              setMonth(null);
              setYear("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

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
