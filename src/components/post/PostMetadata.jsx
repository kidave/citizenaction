"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function PostMetadata({ post, forceExpanded = false }) {
  if (!forceExpanded) return null;

  const start = post?.start_at ? new Date(post.start_at) : null;
  const precision = post?.metadata?.date_precision || "date";
  const hasAddress = Boolean(post?.address);

  const mapUrl = hasAddress
    ? "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(post.address)
    : null;

  if (!start && !hasAddress) return null;

  const dateText =
    precision === "year"
      ? format(start, "yyyy")
      : precision === "month"
        ? format(start, "MMMM yyyy")
        : format(start, "d MMMM yyyy");

  return (
    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      {start && (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>{dateText}</span>
        </div>
      )}

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
