"use client";

import Link from "next/link";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Video,
  Radio,
} from "lucide-react";

import {
  format,
  formatDistanceToNowStrict,
  isSameYear,
} from "date-fns";

import { Badge } from "@/components/ui/badge";

import getPostTypeConfig
from "@/utils/feed/getPostTypeConfig";

import getPostStatus
from "@/utils/feed/getPostStatus";

export default function PostMetadata({
  post,
  forceExpanded = false,
}) {
  if (!post?.start_at) {
    return null;
  }

  const config =
    getPostTypeConfig(post.type);

  const status =
    getPostStatus(post);
  
  const statusUI = config.statuses?.[ status?.key ];

  const start =
    new Date(post.start_at);

  const end = post.end_at
    ? new Date(post.end_at)
    : null;

  // =====================================================
  // COMPACT FEED MODE
  // =====================================================

  if (!forceExpanded) {
    return (
      <div className="flex items-center gap-2 flex-wrap">

        {/* COUNTDOWN */}
        {statusUI &&
        !statusUI.hidden && (
          <Badge
            variant="secondary"
            className={
              statusUI.className
            }
          >
            {status?.key ===
              "live" && (
              <Radio className="h-3 w-3 mr-1" />
            )}
      
          {statusUI.label}
      
        </Badge>
      )}

        {config.showCountdown &&
        status?.key === "upcoming" &&
        post.start_at && (

          <div
            className="
              inline-flex
              items-center
              gap-1.5

              text-xs
              font-medium

              text-blue-700
              bg-blue-50

              px-2.5
              py-1

              rounded-full

              border
              border-blue-100
            "
          >

          <div
            className="
              h-2
              w-2
              rounded-full
              bg-blue-500
            "
          />

          <span>

            Starts in{" "}
            {formatDistanceToNowStrict(
              new Date(
                post.start_at
              )
            )}

          </span>

        </div>
      )}

      </div>
    );
  }

  // =====================================================
  // EXPANDED MODE
  // =====================================================

  return (
    <div className="space-y-3">

      {statusUI &&
        !statusUI.hidden && (
          <Badge
            variant="secondary"
            className={
              statusUI.className
            }
          >
            {status?.key ===
              "live" && (
              <Radio className="h-3 w-3 mr-1" />
            )}
      
          {statusUI.label}
      
        </Badge>
      )}

      {config.showCountdown &&
        status?.key === "upcoming" &&
        post.start_at && (

          <div
            className="
              inline-flex
              items-center
              gap-1.5

              text-xs
              font-medium

              text-blue-700
              bg-blue-50

              px-2.5
              py-1

              rounded-full

              border
              border-blue-100
            "
          >

          <div
            className="
              h-2
              w-2
              rounded-full
              bg-blue-500
            "
          />

          <span>

            Starts in{" "}
            {formatDistanceToNowStrict(
              new Date(
                post.start_at
              )
            )}

          </span>

        </div>
      )}

      {/* DATE */}

      <div className="space-y-2 text-sm text-muted-foreground">

        <div className="flex items-center gap-2">

          <CalendarDays className="h-4 w-4" />

          <span>

            {format(
              start,
              isSameYear(
                start,
                new Date()
              )
                ? "d MMM"
                : "d MMM yyyy"
            )}

          </span>

        </div>

        {/* TIME */}

        {config.showTime && (
          <div className="flex items-center gap-2">

            <Clock3 className="h-4 w-4" />

            <span>

              {format(
                start,
                "h:mm a"
              )}

              {end && (
                <>
                  {" "}
                  -{" "}
                  {format(
                    end,
                    "h:mm a"
                  )}
                </>
              )}

            </span>

          </div>
        )}

      </div>

      {/* ADDRESS */}

      {config.showAddress &&
        post.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">

            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />

            <span>
              {post.address}
            </span>

          </div>
        )}

      {/* JOIN */}

      {config.showJoin &&
        post.meeting_link &&
        status?.key !==
          "ended" && (
          <Link
            href={post.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-4
              py-2
              text-sm
              font-medium
              bg-primary
              text-primary-foreground
              hover:opacity-90
              transition
            "
          >

            <Video className="h-4 w-4" />

            {status?.key ===
            "live"
              ? "Join Now"
              : post.type ===
                "event"
              ? "Join Event"
              : "Join Meeting"}

          </Link>
        )}

    </div>
  );
}