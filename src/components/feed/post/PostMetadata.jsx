"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { CalendarDays, Clock3, MapPin, Video } from "lucide-react";

import { format, formatDistanceToNowStrict } from "date-fns";

import PostCalendarActions from "@/components/shared/PostCalendarActions";

import getPostTypeConfig from "@/utils/feed/getPostTypeConfig";

import getPostStatus from "@/utils/feed/getPostStatus";

const pillStyles = {
  live: `
    text-red-700
    bg-red-50
    border-red-200
  `,

  countdown: `
    text-blue-700
    bg-blue-50
    border-blue-100
  `,
};

function StatusPill({ type, children, pulse = false }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${pillStyles[type]} `}
    >
      <div
        className={`h-2 w-2 rounded-full ${
          type === "live" ? "bg-red-500" : "bg-blue-500"
        } ${pulse ? "animate-pulse" : ""} `}
      />

      <span>{children}</span>
    </div>
  );
}

export default function PostMetadata({ post, forceExpanded = false }) {
  const [mounted, setMounted] = useState(false);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // CONFIG
  // =====================================================

  const config = getPostTypeConfig(post.type);

  // =====================================================
  // STATUS
  // =====================================================

  const status = useMemo(
    () => getPostStatus(post, mounted ? now : null),

    [post, now, mounted],
  );

  // =====================================================
  // GUARDS
  // =====================================================

  if (!post?.start_at) {
    return null;
  }

  // =====================================================
  // DATES
  // =====================================================

  const start = new Date(post.start_at);

  const end = post.end_at ? new Date(post.end_at) : null;

  // =====================================================
  // UI FLAGS
  // =====================================================

  const compactMode = !forceExpanded;

  const showCountdown =
    mounted && status?.key === "upcoming" && status?.countdown;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mb-2 gap-2 space-y-2">
      {/* STATUS */}

      <div className="flex flex-wrap items-center gap-2">
        {post.status && !config.lifecycle && (
          <StatusPill type="countdown">{post.status}</StatusPill>
        )}

        {status?.key === "live" && (
          <StatusPill type="live" pulse>
            LIVE NOW
          </StatusPill>
        )}

        {showCountdown && (
          <StatusPill type="countdown">
            Starts in {formatDistanceToNowStrict(start)}
          </StatusPill>
        )}
      </div>

      {/* FEED MODE */}

      {compactMode && null}

      {/* EXPANDED MODE */}

      {!compactMode && (
        <>
          {/* DATE/TIME */}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {/* DATE */}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />

              <span>{format(start, "d MMMM yyyy")}</span>
            </div>

            {/* TIME */}
            {config.showTime && (
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 shrink-0" />

                <span>
                  {format(start, "h:mm a")}

                  {end && <> - {format(end, "h:mm a")}</>}
                </span>
              </div>
            )}
          </div>

          {/* ADDRESS */}

          {config.showAddress && post.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{post.address}</span>
            </div>
          )}

          {/* JOIN */}

          {config.showJoin && post.meeting_link && status?.key === "live" && (
            <Link
              href={post.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Video className="h-4 w-4" />
              Join Now
            </Link>
          )}

          {/* CALENDAR */}

          {showCountdown && <PostCalendarActions post={post} />}
        </>
      )}
    </div>
  );
}
