"use client";

import { ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import AttachmentCarousel from "@/components/attachment/AttachmentCarousel";
import { Button } from "@/components/ui/button";

export default function EditorAttachments({
  attachments,
  setAttachments,
  open,
  setOpen,
}) {
  if (!attachments?.length) return null;

  return (
    <div
      className={`border-t bg-background transition-[height] duration-300 ${
        open ? "h72" : "h-12"
      }`}
    >
      {/* Header */}

      <Button
        onClick={() => setOpen(!open)}
        variant="ghost"
        size="icon"
        className="flex h-12 w-full items-center justify-center"
      >
        {!open ? (
          <div className="flex items-center gap-2">
            <Paperclip />
            <span className="text-sm font-medium">
              {attachments.length} Attachment
              {attachments.length > 1 && "s"}
            </span>
          </div>
        ) : (
          <div className="h-1 w-10 rounded-full bg-border" />
        )}
      </Button>

      {/* Drawer */}

      <div
        className={`overflow-hidden px-3 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <AttachmentCarousel
          attachments={attachments}
          showMetadata
          removable
          onAttachmentClick={() => {}}
          onRemove={(index) =>
            setAttachments((prev) => prev.filter((_, i) => i !== index))
          }
          onCreditNameChange={(index, value) =>
            setAttachments((prev) =>
              prev.map((a, i) =>
                i === index
                  ? {
                      ...a,
                      credit_name: value,
                    }
                  : a,
              ),
            )
          }
        />
      </div>
    </div>
  );
}
