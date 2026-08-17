"use client";

import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { getHostname, getLinkTypeLabel } from "@/utils/text/detectLinkType";

export default function LinkRow({ link, index, total, onMove, onRemove }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border p-3">
      {/* Icon */}

      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {link.icon_url ? (
          <img src={link.icon_url} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {link.title || getLinkTypeLabel(link.type)}
        </div>

        <div className="truncate text-xs text-muted-foreground">
          {link.hostname || getHostname(link.url)}
        </div>
      </div>

      {/* Actions */}

      <div className="flex shrink-0 items-center">
        <Button type="button" variant="ghost" size="icon" asChild>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>

        {/* Desktop reorder */}

        <div className="hidden flex-col sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          aria-label="Remove link"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
