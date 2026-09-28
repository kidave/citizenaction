"use client";

import { CalendarDays, MapPin, Building2 } from "lucide-react";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DocumentHeader({ post, context }) {
  const category = context?.category;
  const geography = context?.geography;
  const organization = context?.organization;
  const date = formatDate(post?.start_at || post?.created_at);

  return (
    <header className="px-4 pt-8 sm:px-0 sm:pt-12">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {category?.name && <span className="font-medium text-foreground">{category.name}</span>}
        {category?.name && geography?.name && <span>·</span>}
        {geography?.name && <span>{geography.name}</span>}
      </div>

      <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        {post?.title || "Untitled document"}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {organization?.name && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{organization.short_name || organization.name}</span>
          </div>
        )}
        {date && (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{date}</span>
          </div>
        )}
        {post?.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-start gap-2 hover:text-foreground"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="break-words hover:underline">{post.address}</span>
          </a>
        )}
      </div>
    </header>
  );
}
