"use client";

import { useState, useMemo, useEffect } from "react";
import { useMeetings } from "@/hooks/useMeetings";
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
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function MeetingTab({ clubId }) {
  const { data: meetings = [], isLoading } = useMeetings({
    clubId,
    enabled: clubId !== undefined,
  });

  const now = new Date();

  // ✅ derive years
  const years = useMemo(() => {
    const allYears = meetings.map((m) =>
      new Date(m.created_at).getFullYear()
    );
    return [...new Set(allYears)].sort((a, b) => b - a);
  }, [meetings]);

  // ✅ default latest year
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  useEffect(() => {
    if (years.length && year === null) {
      setYear(years[0]); // latest year
    }
  }, [years, year]);

  // ✅ filter logic
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const d = new Date(m.created_at);

      const matchYear = year
        ? d.getFullYear() === year
        : true;

      const matchMonth =
        month !== null
          ? d.getMonth() === month
          : true;

      return matchYear && matchMonth;
    });
  }, [meetings, year, month]);

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

      {/* 🔥 FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Year Dropdown */}
        <select
          value={year || ""}
          onChange={(e) => {
            setYear(Number(e.target.value));
            setMonth(null); // ✅ reset month
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Month Dropdown */}
        <select
          value={month ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setMonth(val === "" ? null : Number(val));
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All months</option>
          {months.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        {/* Clear Month */}
        {month !== null && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMonth(null)}
          >
            Clear
          </Button>
        )}
      </div>

      {/* 🔥 CONTENT */}
      {!filteredMeetings.length ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No meetings</CardTitle>
            <CardDescription>
              No meetings found for selected month.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => (
            <MeetingPreviewCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}

    </div>
  );
}