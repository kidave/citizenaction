"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";

import AttachmentCarousel from "@/components/attachment/AttachmentCarousel";
import { Button } from "@/components/ui/button";

export default function EditorResourcePreview({
  attachments = [],
  links = [],
  setAttachments,
  removable = false,
  showMetadata = true,
  size = "sm",
}) {
  const [open, setOpen] = useState(false);
  const itemCount = (attachments?.length || 0) + (links?.length || 0);

  if (!itemCount) return null;

  return (
    <div className={`border-t bg-background transition-[height] duration-300 ${
      open ? "h-72" : "h-12"
    }`}>
      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        variant="ghost"
        size="icon"
        className="flex h-12 w-full items-center justify-center"
        aria-label={
          open
            ? "Collapse attachments and links"
            : "Show attachments and links"
        }
      >
        {!open ? (
          <div className="flex items-center gap-2">
            <Paperclip />
            <span className="text-sm font-medium">
              {itemCount} Resource{itemCount > 1 && "s"}
            </span>
          </div>
        ) : (
          <div className="h-1 w-10 rounded-full bg-border" />
        )}
      </Button>

      <div
        className={`overflow-hidden px-3 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <AttachmentCarousel
          attachments={attachments}
          links={links}
          showMetadata={showMetadata}
          removable={removable}
          size={size}
          onAttachmentClick={() => {}}
          onRemove={(index) =>
            setAttachments?.((prev) => prev.filter((_, i) => i !== index))
          }
          onCreditNameChange={(index, value) =>
            setAttachments?.((prev) =>
              prev.map((attachment, i) =>
                i === index
                  ? { ...attachment, credit_name: value }
                  : attachment,
              ),
            )
          }
        />
      </div>
    </div>
  );
}
