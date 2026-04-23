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

  function isUrl(str) {
    return str?.startsWith("http");
  }

  /* ================= MEETING STATUS (AUTO DERIVED) ================= */

  useEffect(() => {

    if (type !== "meeting") return;
    if (!date || !time) return;

    const COUNTDOWN_THRESHOLD_MINUTES = 6 * 60;

    const updateStatus = () => {
      const meetingStart = new Date(`${date}T${time}`);
      if (!isValid(meetingStart)) return;

      const meetingEnd = new Date(
        meetingStart.getTime() + 60 * 60 * 1000 // 1 hour duration
      );

      const now = new Date();

      // BEFORE START
      if (isBefore(now, meetingStart)) {
        setMeetingStatus("Upcoming");

        const minutesLeft = differenceInMinutes(
          meetingStart,
          now
        );

        if (minutesLeft > 0 && minutesLeft <= 6 * 60) {
          const hours = Math.floor(minutesLeft / 60);
          const minutes = minutesLeft % 60;
          setCountdown({ hours, minutes });
        } else {
          setCountdown(null);
        }

        return;
      }

      // ONGOING (within 1 hour)
      if (isAfter(now, meetingStart) && isBefore(now, meetingEnd)) {
        setMeetingStatus("Ongoing");
        setCountdown(null);
        return;
      }

      // COMPLETED (after 1 hour)
      if (isAfter(now, meetingEnd)) {
        setMeetingStatus("Completed");
        setCountdown(null);
        return;
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);

  }, [date, time, type]);

  function canJoinMeeting(type, meetingStatus) {
    if (type !== "meeting") return true;

    return (
      meetingStatus === "Upcoming" ||
      meetingStatus === "Ongoing"
    );
  }

  const isUpcomingMeeting =
    type === "meeting" &&
    meetingStatus === "Upcoming" &&
    date &&
    time;

  function getJoinButtonStyle(status) {
    switch (status) {
      case "Ongoing":
        return "bg-green-500 animate-pulse";
      case "Upcoming":
        return "bg-blue-500";
      default:
        return "bg-muted";
    }
  }

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

          {isUrl(location) ? (
            meetingStatus === "Completed" ? (
              <span className="text-muted-foreground">
                Meeting Closed
              </span>
            ) : (
              <a
                href={location}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded text-white text-xs transition ${
                  getJoinButtonStyle(meetingStatus)
                }`}
              >
                Join Meeting
              </a>
            )
          ) : (
            <button
              onClick={() => {
                const url = `https://www.google.com/maps?q=${encodeURIComponent(location)}`;
                window.open(url, "_blank");
              }}
              className="flex items-center gap-1 hover:underline"
            >
              {location}
            </button>
          )}

        </div>
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