"use client";

import { useEffect, useState } from "react";
import {
  format,
  parseISO,
  isValid,
  isAfter,
  isBefore,
  differenceInMinutes,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostMetadata({
  date,
  time,
  location,
  type,
  title = "Meeting",
  description = "",
}) {

  const [meetingStatus, setMeetingStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const userTimeZone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  /* ================= DATE FORMATTERS ================= */

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return "";
    return format(parsed, "d MMMM yyyy");
  };

  const formatTime = (date, time) => {
    if (!date || !time) return "";
    const parsed = new Date(`${date}T${time}`);
    if (!isValid(parsed)) return "";
    return format(parsed, "h:mm a");
  };

  /* ================= MEETING STATUS (AUTO DERIVED) ================= */

  useEffect(() => {

    if (type !== "meeting") return;
    if (!date || !time) return;

    const COUNTDOWN_THRESHOLD_MINUTES = 6 * 60;

    const updateStatus = () => {

      const meetingDate = new Date(`${date}T${time}`);
      if (!isValid(meetingDate)) return;

      const now = new Date();

      if (isAfter(meetingDate, now)) {

        setMeetingStatus("Upcoming");

        const minutesLeft = differenceInMinutes(
          meetingDate,
          now
        );

        if (
          minutesLeft > 0 &&
          minutesLeft <= COUNTDOWN_THRESHOLD_MINUTES
        ) {
          const hours = Math.floor(minutesLeft / 60);
          const minutes = minutesLeft % 60;
          setCountdown({ hours, minutes });
        } else {
          setCountdown(null);
        }

      } else if (isBefore(meetingDate, now)) {

        setMeetingStatus("Completed");
        setCountdown(null);

      } else {

        setMeetingStatus("Ongoing");
        setCountdown(null);

      }

    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);

  }, [date, time, type]);

  const isUpcomingMeeting =
    type === "meeting" &&
    meetingStatus === "Upcoming" &&
    date &&
    time;

  /* ================= GOOGLE CALENDAR ================= */

  const handleGoogleCalendar = () => {

    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatGoogleDate = (d) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&details=${encodeURIComponent(description)}` +
      `&location=${encodeURIComponent(location || "")}` +
      `&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}` +
      `&ctz=${userTimeZone}`;

    window.open(url, "_blank");

  };

  /* ================= ICS DOWNLOAD ================= */

  const handleICSDownload = () => {

    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatICS = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CitizenAction//Meeting//EN
BEGIN:VEVENT
UID:${Date.now()}@citizenaction.app
DTSTAMP:${formatICS(new Date())}
DTSTART:${formatICS(start)}
DTEND:${formatICS(end)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location || ""}
END:VEVENT
END:VCALENDAR
`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "meeting.ics";
    link.click();

  };

  /* ================= RENDER ================= */

  if (!date && !location && type !== "meeting") return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

      <Badge
        variant="secondary"
        className="text-xs shrink-0"
      >
        {type.toUpperCase()}
      </Badge>

      {date && (
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(date)}
        </div>
      )}

      {time && (
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(date, time)}
        </div>
      )}

      {location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </div>
      )}

      {/* Meeting Derived Status */}
      {type === "meeting" && meetingStatus && (
        <>
          <span className="opacity-40">•</span>
          <span className="font-medium">
            {meetingStatus}
          </span>
        </>
      )}

      {/* Calendar buttons only for upcoming meetings */}
      {isUpcomingMeeting && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGoogleCalendar}
          >
            Add to Calendar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleICSDownload}
          >
            Download .ics
          </Button>
        </div>
      )}

    </div>
  );
}