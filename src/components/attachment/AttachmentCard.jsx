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
}) {
  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-500 ease-out md:rounded-2xl",

        hovered !== null &&
          hovered !== index &&
          "scale-[0.97] opacity-60 blur-[2px]",

        hovered === index &&
          "z-10 scale-[1.04] border-primary/30 shadow-2xl shadow-white/10",

        className,
      )}
    >
      {/* Preview */}

      <div
        onClick={() => onClick?.(index)}
        className="relative aspect-square cursor-pointer overflow-hidden bg-muted md:aspect-[16/10]"
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
        <div className="space-y-2 p-2">
          <p className="truncate text-sm font-medium">{attachment.file_name}</p>

          <Input
            value={attachment.credit_name ?? ""}
            placeholder="Add credit"
            onChange={(e) => onCreditNameChange?.(index, e.target.value)}
            className="h-4 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />

          <div className="space-y-0.5 text-xs text-muted-foreground">
            <p>
              {getFileExtension(attachment.file_name)} •{" "}
              {formatFileSize(attachment.file_size)}
            </p>

            {attachment.credit_name && (
              <p className="truncate">{attachment.credit_name}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
