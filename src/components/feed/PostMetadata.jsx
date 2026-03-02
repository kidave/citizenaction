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
  metadata,
  status,
  type,
  title = "Event",
  description = "",
  showCountdown = true,
}) {
  const [eventStatus, setEventStatus] = useState(null);
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

  

  /* ================= STATUS LOGIC ================= */

  useEffect(() => {
    if (type !== "event") return;
    if (!metadata?.date || !metadata?.time) return;

    const COUNTDOWN_THRESHOLD_MINUTES = 6 * 60; // 6 hours

    const updateStatus = () => {
      const eventDate = new Date(
        `${metadata.date}T${metadata.time}`
      );

      if (!isValid(eventDate)) return;

      const now = new Date();

      if (isAfter(eventDate, now)) {
        setEventStatus("Upcoming");

        const minutesLeft = differenceInMinutes(
          eventDate,
          now
        );

        if (minutesLeft > 0) {
          if (minutesLeft <= COUNTDOWN_THRESHOLD_MINUTES) {
            const hours = Math.floor(minutesLeft / 60);
            const minutes = minutesLeft % 60;

            setCountdown({ hours, minutes });
          } else {
            setCountdown(null);
          }
        }
      } else if (isBefore(eventDate, now)) {
        setEventStatus("Completed");
        setCountdown(null);
      } else {
        setEventStatus("Ongoing");
        setCountdown(null);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [metadata?.date, metadata?.time, type]);

  const isUpcomingEvent =
    type === "event" &&
    eventStatus === "Upcoming" &&
    metadata?.date &&
    metadata?.time;
    

  /* ================= GOOGLE CALENDAR ================= */

  const handleGoogleCalendar = () => {
    const start = new Date(
      `${metadata.date}T${metadata.time}`
    );

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatGoogleDate = (d) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&details=${encodeURIComponent(
      description
    )}&location=${encodeURIComponent(
      metadata.location || ""
    )}&dates=${formatGoogleDate(start)}/${formatGoogleDate(
      end
    )}&ctz=${userTimeZone}`;

    window.open(url, "_blank");
  };

  /* ================= ICS FALLBACK ================= */

  const handleICSDownload = () => {
    const start = new Date(
      `${metadata.date}T${metadata.time}`
    );

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatICS = (date) =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CitizenAction//Event//EN
BEGIN:VEVENT
UID:${Date.now()}@citizenaction.app
DTSTAMP:${formatICS(new Date())}
DTSTART:${formatICS(start)}
DTEND:${formatICS(end)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${metadata.location || ""}
END:VEVENT
END:VCALENDAR
`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "event.ics";
    link.click();
  };

  if (!metadata && !status) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

      {metadata?.date && (
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(metadata.date)}
        </div>
      )}

      {metadata?.time && (
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(metadata.date, metadata.time)}
        </div>
      )}

      {metadata?.location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate max-w-[150px]">
            {metadata.location}
          </span>
        </div>
      )}

      {eventStatus && (
        <>
          <span className="opacity-40">•</span>
          <span
            className={`font-medium ${
              eventStatus === "Upcoming"
                ? "text-blue-600"
                : eventStatus === "Ongoing"
                ? "text-green-600"
                : "text-muted-foreground"
            }`}
          >
            {eventStatus}
          </span>
        </>
      )}

      {/* CALENDAR ACTIONS */}
      {isUpcomingEvent && (
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

      {status && (
        <>
          <span className="opacity-40">•</span>
          <span className="font-medium text-foreground">
            {status}
          </span>
        </>
      )}
    </div>
  );
}