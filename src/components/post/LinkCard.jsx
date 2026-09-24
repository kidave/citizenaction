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

function shouldShowHostname(link) {
  return link.type === "website" && !!link.hostname;
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
      className="group flex h-[144px] min-h-0 w-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-md md:rounded-2xl"
    >
      {link.image_url ? (
        <div className="relative h-[84px] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={link.image_url}
            alt={link.title || provider}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="flex h-[84px] w-full shrink-0 items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <ProviderIcon className="h-7 w-7" />
            <span className="text-xs font-medium">{provider}</span>
          </div>
        </div>
      )}

      {compact ? (
        <div className="min-h-0 flex-1 px-2.5 py-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <ProviderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {provider}
            </span>
            <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] font-medium leading-tight">
            <span className="truncate">{title}</span>
            {shouldShowHostname(link) && (
              <>
                <span className="shrink-0 text-muted-foreground">•</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {link.hostname}
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 px-3 py-2">
          <div className="mb-1 flex items-center gap-1.5">
            <ProviderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs font-medium text-muted-foreground">
              {provider}
            </span>
            <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="truncate text-xs font-medium leading-snug">{title}</div>

          {link.description && (
            <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
              {link.description}
            </div>
          )}

          {shouldShowHostname(link) && (
            <div className="mt-1 truncate text-[10px] text-muted-foreground">
              {link.hostname}
            </div>
          )}
        </div>
      )}
    </a>
  );
}
