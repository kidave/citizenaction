"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus, Download } from "lucide-react";

export default function PostCalendarActions({ post }) {
  if (!post?.date || !post?.time) return null;

  const start = new Date(`${post.date}T${post.time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const format = (d) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const locationValue =
    post.mode === "online" ? post.meeting_link : post.address;

  function handleGoogleCalendar() {
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(post.summary || "Meeting/Event")}` +
      `&details=${encodeURIComponent(post.details || "")}` +
      `&location=${encodeURIComponent(locationValue || "")}` +
      `&dates=${format(start)}/${format(end)}`;

    window.open(url, "_blank");
  }

  function handleICSDownload() {
    const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${Date.now()}@citizenaction
DTSTAMP:${format(new Date())}
DTSTART:${format(start)}
DTEND:${format(end)}
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
    link.download = "meeting.ics";
    link.click();
  }

  return (
    <div className="flex gap-2 mb-3">
      <Button
        size="sm"
        variant="outline"
        onClick={handleGoogleCalendar}
        className="flex items-center gap-1"
      >
        <CalendarPlus className="h-4 w-4" />
        Add to Calendar
      </Button>

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