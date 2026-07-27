"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getFileExtension, formatFileSize } from "@/utils/attachment";

import AttachmentPreview from "./AttachmentPreview";

export default function AttachmentCard({
  attachment,
  index,
  onClick,
  onRemove,
  removable = false,

  showMetadata = true,

  hovered = null,
  setHovered = () => {},

  className,
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(index)}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border bg-card text-left transition-all duration-500 ease-out md:rounded-2xl",
        "focus:outline-none focus:ring-2 focus:ring-primary/30",

        hovered !== null &&
          hovered !== index &&
          "scale-[0.97] opacity-60 blur-[2px]",

        hovered === index &&
          "z-10 scale-[1.04] border-primary/30 shadow-2xl shadow-white/10",

        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted md:aspect-[16/10]">
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]">
          <AttachmentPreview attachment={attachment} />
        </div>

        {removable && (
          <button
            type="button"
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(index);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showMetadata && (
        <div className="space-y-1 p-3">
          <p className="truncate text-sm font-medium">{attachment.name}</p>

          <p className="text-xs text-muted-foreground">
            {getFileExtension(attachment.name)} •{" "}
            {formatFileSize(attachment.size)}
          </p>
        </div>
      )}
    </button>
  );
}
