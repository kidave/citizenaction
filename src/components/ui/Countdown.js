"use client";

import { useEffect, useState } from "react";
import {
  differenceInMinutes,
  isAfter,
  isBefore,
  isValid,
} from "date-fns";
import { Clock } from "lucide-react";

export default function Countdown({
  date,
  time,
  thresholdHours = 6,
  className = "",
}) {
  const [status, setStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!date || !time) return;

    const COUNTDOWN_THRESHOLD_MINUTES =
      thresholdHours * 60;

    const update = () => {
      const meetingDate = new Date(`${date}T${time}`);
      if (!isValid(meetingDate)) return;

      const now = new Date();

      if (isAfter(meetingDate, now)) {
        setStatus("Upcoming");

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
        setStatus("Completed");
        setCountdown(null);
      } else {
        setStatus("Ongoing");
        setCountdown(null);
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [date, time, thresholdHours]);

  if (!countdown) return null;

  /* ---------- Urgency Colors ---------- */

  const totalMinutes =
    countdown.hours * 60 + countdown.minutes;

  let style =
    "bg-blue-50 text-blue-700 border-blue-200";

  if (totalMinutes <= 120) {
    style =
      "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (totalMinutes <= 30) {
    style =
      "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <div
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${style} ${className}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4" />
        {countdown.hours > 0 ? (
          <span>
            Meeting starts in {countdown.hours}h{" "}
            {countdown.minutes}m
          </span>
        ) : (
          <span>
            Meeting starts in {countdown.minutes}m
          </span>
        )}
      </div>

      <div className="text-xs opacity-70">
        Be prepared
      </div>
    </div>
  );
}