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
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const types = ["Select Type", "action", "meeting", "report", "event", "update"];

export default function ActivityTab({ clubId }) {
  const { data: feed = [], isLoading } = useFeed();

  // ✅ Fetch ALL meetings (for attendees)
  const { data: meetings = [] } = useMeetings({
    enabled: true,
  });

  // ✅ Map meetings by ID
  const meetingMap = useMemo(() => {
    return new Map(
      meetings.map((m) => [m.id, m])
    );
  }, [meetings]);

  const currentYear = new Date().getFullYear();

  // ✅ Filter by club OR community
  const filteredByClub = useMemo(() => {
    return feed.filter((f) =>
      f.club_id === clubId || f.club_id === null
    );
  }, [feed, clubId]);

  // ✅ Date helper
  const getDate = (m) => {
    if (m.metadata_date) return new Date(m.metadata_date);
    if (m.date) return new Date(m.date);
    return new Date(m.sort_date);
  };

  // ✅ derive years
  const years = useMemo(() => {
    const allYears = filteredByClub.map((m) =>
      getDate(m).getFullYear()
    );

    const uniqueYears = [...new Set(allYears)];

    if (!uniqueYears.includes(currentYear)) {
      uniqueYears.push(currentYear);
    }

    return uniqueYears.sort((a, b) => b - a);
  }, [filteredByClub, currentYear]);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState(null);
  const [type, setType] = useState("all");

  // ✅ final filtering
  const finalFeed = useMemo(() => {
    return filteredByClub.filter((m) => {
      const d = getDate(m);

      const matchYear = year
        ? d.getFullYear() === Number(year)
        : true;

      const matchMonth =
        month !== null ? d.getMonth() === month : true;

      const matchType =
        type === "all" ? true : m.type === type;

      return matchYear && matchMonth && matchType;
    });
  }, [filteredByClub, year, month, type]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <MeetingSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3">

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setMonth(null);
          }}
          className="border rounded-md px-3 py-2 text-sm"
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
            const val = e.target.value;
            setMonth(val === "" ? null : Number(val));
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select Month</option>
          {months.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        {month !== null && (
          <Button size="sm" variant="ghost" onClick={() => setMonth(null)}>
            Clear
          </Button>
        )}
                <div className="flex items-center gap-2 ml-auto flex-wrap text-xs">

        <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-500"></span>
            Action
        </div>

        <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
            Report
        </div>

        <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-500"></span>
            Event
        </div>

        <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-pink-500"></span>
            Update
        </div>

        <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-yellow-500"></span>
            Meeting
        </div>

        </div>
      </div>


      {/* CONTENT */}
      {!finalFeed.length ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No activity</CardTitle>
            <CardDescription>
              No activity found for selected filters.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {finalFeed.map((post) => {

            if (post.type === "meeting") {
              const fullMeeting = meetingMap.get(post.id);

              return (
                <MeetingPreviewCard
                  key={post.id}
                  meeting={{
                    ...post,
                    attendees: fullMeeting?.attendees || [],
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