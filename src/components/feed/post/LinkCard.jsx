"use client";

import Image from "next/image";
import { ExternalLink, Globe, MapPin, Video } from "lucide-react";

function getProviderLabel(link) {
  switch (link.type) {
    case "youtube":
      return "YouTube";

    case "vimeo":
      return "Vimeo";

    case "zoom":
      return "Zoom";

    case "google_meet":
      return "Google Meet";

    case "teams":
      return "Microsoft Teams";

    case "maps":
      return "Google Maps";

    default:
      return link.provider_name || link.hostname || "Website";
  }
}

function getProviderIcon(type) {
  switch (type) {
    case "maps":
      return MapPin;

    case "youtube":
    case "vimeo":
    case "zoom":
    case "google_meet":
    case "teams":
      return Video;

    default:
      return Globe;
  }
}

export default function LinkCard({ link }) {
  if (!link?.url) {
    return null;
  }

  const ProviderIcon = getProviderIcon(link.type);

  const provider = getProviderLabel(link);

  const title = link.title || link.hostname || link.provider_name || link.url;

  const description = link.description || null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.stopPropagation();
      }}
      className="group block overflow-hidden rounded-2xl border bg-background transition-colors hover:bg-muted/50"
    >
      {/* Thumbnail */}

      {link.image_url && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={link.image_url}
            alt={link.title || provider}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Content */}

      <div className="min-w-0 p-4">
        {/* Provider */}

        <div className="mb-2 flex items-center gap-2">
          <ProviderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span className="truncate text-xs font-medium text-muted-foreground">
            {provider}
          </span>

          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Title */}

        <div className="line-clamp-2 text-sm font-semibold">{title}</div>

        {/* Description */}

        {description && (
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {description}
          </div>
        )}

        {/* Hostname */}

        {link.hostname && (
          <div className="mt-2 truncate text-xs text-muted-foreground">
            {link.hostname}
          </div>
        )}
      </div>
    </a>
  );
}
