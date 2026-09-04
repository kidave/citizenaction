"use client";

import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function PostMetadata({ post, forceExpanded = false }) {
  if (!forceExpanded) return null;

  const start = post?.start_at ? new Date(post.start_at) : null;
  const end = post?.end_at ? new Date(post.end_at) : null;

  const hasAddress = Boolean(post?.address);

  const mapUrl = hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        post.address,
      )}`
    : null;

  if (!start && !hasAddress) return null;

  return (
    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      {/* DATE + TIME */}

      {start && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{format(start, "d MMMM yyyy")}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0" />

            <span>
              {format(start, "h:mm a")}
              {end && <> - {format(end, "h:mm a")}</>}
            </span>
          </div>
        </div>
      )}

      {/* ADDRESS */}

      {hasAddress && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 transition-colors hover:text-foreground"
        >
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

          <span className="underline-offset-4 hover:underline">
            {post.address}
          </span>
        </a>
      )}
    </div>
  );
}
