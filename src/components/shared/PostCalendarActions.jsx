"use client";

import { Button } from "@/components/ui/button";

import { CalendarPlus, Download } from "lucide-react";

export default function PostCalendarActions({ post }) {
  if (!post?.start_at) {
    return null;
  }

  // =====================================================
  // DATES
  // =====================================================

  const start = new Date(post.start_at);

  const end = post.end_at
    ? new Date(post.end_at)
    : new Date(start.getTime() + 60 * 60 * 1000);

  // =====================================================
  // FORMAT
  // =====================================================

  const formatDate = (d) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // =====================================================
  // LOCATION
  // =====================================================

  const locationValue = [post.address, post.meeting_link]
    .filter(Boolean)
    .join("\n");

  // =====================================================
  // GOOGLE CALENDAR
  // =====================================================

  function handleGoogleCalendar() {
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(post.summary || "Meeting/Event")}` +
      `&details=${encodeURIComponent(post.details || "")}` +
      `&location=${encodeURIComponent(locationValue || "")}` +
      `&dates=${formatDate(start)}/${formatDate(end)}`;

    window.open(url, "_blank");
  }

  // =====================================================
  // ICS DOWNLOAD
  // =====================================================

  function handleICSDownload() {
    const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${Date.now()}@citizenaction
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${post.summary || "Meeting/Event"}
DESCRIPTION:${post.details || ""}
LOCATION:${locationValue || ""}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], {
      type: "text/calendar;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "event.ics";

    link.click();
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex flex-wrap gap-2">
      {/* GOOGLE */}

      <Button
        size="sm"
        variant="outline"
        onClick={handleGoogleCalendar}
        className="flex items-center gap-1"
      >
        <CalendarPlus className="h-4 w-4" />
        Add to Calendar
      </Button>

      {/* ICS */}

      <Button
        size="sm"
        variant="outline"
        onClick={handleICSDownload}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        .ics
      </Button>
    </div>
  );
}
