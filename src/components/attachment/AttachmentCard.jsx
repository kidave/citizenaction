"use client";

import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFileExtension, formatFileSize } from "@/utils/attachment";

import AttachmentPreview from "@/components/attachment/AttachmentPreview";

export default function AttachmentCard({
  attachment,
  index,
  onClick,
  onRemove,
  onCreditNameChange,
  removable = false,
  showMetadata = true,
  hovered = null,
  setHovered = () => {},
  className,
  size = "default",
}) {
  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-500 ease-out md:rounded-2xl",
        hovered !== null && hovered !== index && "opacity-60 blur-[2px]",
        hovered === index && "z-10",
        className,
      )}
    >
      {/* Preview */}
      <div
        onClick={() => onClick?.(index)}
        className={cn(
          "relative cursor-pointer overflow-hidden bg-muted",
          size === "compact" || size === "sm"
            ? "aspect-[16/9]"
            : "aspect-square md:aspect-[16/10]",
        )}
      >
        <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]">
          <AttachmentPreview attachment={attachment} />
        </div>

        {removable && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(index);
            }}
          >
            <X />
          </Button>
        )}
      </div>

      {/* Metadata */}
      {showMetadata && (
        <div
          className={cn(
            "space-y-1.5",
            size === "sm" || size === "compact" ? "p-2" : "p-3",
          )}
        >
          <Input
            value={attachment.credit_name ?? ""}
            placeholder="Add credit"
            aria-label="Credit name"
            onChange={(e) => onCreditNameChange?.(index, e.target.value)}
            className="h-6 min-w-0 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 md:text-xs"
          />

          <div className="truncate text-xs text-muted-foreground">
            <span className="uppercase">
              {getFileExtension(
                attachment.file_name || attachment.file?.name || "",
              )}
            </span>
            {" • "}
            {formatFileSize(
              attachment.file_size ?? attachment.file?.size ?? null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
