"use client";

import Image from "next/image";
import { ExternalLink, Globe, MapPin, Video } from "lucide-react";

function getProviderLabel(link) {
  switch (link.type) {
    case "youtube": return "YouTube";
    case "vimeo": return "Vimeo";
    case "zoom": return "Zoom";
    case "google_meet": return "Google Meet";
    case "teams": return "Microsoft Teams";
    case "maps": return "Google Maps";
    default: return link.provider_name || link.hostname || "Website";
  }
}

function getProviderIcon(type) {
  switch (type) {
    case "maps": return MapPin;
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

export default function LinkCard({ link, size = "default" }) {
  if (!link?.url) return null;

  const ProviderIcon = getProviderIcon(link.type);
  const provider = getProviderLabel(link);
  const compact = size === "sm" || size === "compact";
  const title = link.title || link.provider_name || link.hostname || link.url;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      className="group flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-md md:rounded-2xl"
    >
      {link.image_url ? (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={link.image_url}
            alt={link.title || provider}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full shrink-0 items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <ProviderIcon className="h-7 w-7" />
            <span className="text-xs font-medium">{provider}</span>
          </div>
        </div>
      )}

      <div className={`min-h-0 flex-1 ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}>
          <div className="mb-1 flex items-center gap-1.5">
            <ProviderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs font-medium text-muted-foreground">
              {provider}
            </span>
            <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="truncate text-xs font-medium leading-snug">{title}</div>


        </div>
      </div>
    </a>
  );
}
