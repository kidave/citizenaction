"use client";

import { Check, Pencil, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getFileExtension, formatFileSize } from "@/utils/attachment";

import AttachmentPreview from "@/components/attachment/AttachmentPreview";

export default function AttachmentCard({
  attachment,
  index,
  onClick,
  onRemove,
  onCreditNameChange,
  onEdit,
  removable = false,
  showMetadata = true,
  hovered = null,
  setHovered = () => {},
  className,
  size = "default",
}) {
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [creditDraft, setCreditDraft] = useState(attachment.credit_name ?? "");
  const [altTextDraft, setAltTextDraft] = useState(attachment.alt_text ?? "");
  const isImage = attachment.mime_type?.startsWith("image/");

  useEffect(() => {
    if (!editingMetadata) { setCreditDraft(attachment.credit_name ?? ""); setAltTextDraft(attachment.alt_text ?? ""); }
  }, [attachment.credit_name, attachment.alt_text, editingMetadata]);

  const saveMetadata = () => { onCreditNameChange?.(index, { credit_name: creditDraft.trim(), ...(isImage ? { alt_text: altTextDraft.trim() } : {}) }); setEditingMetadata(false); };
  const cancelMetadata = () => { setCreditDraft(attachment.credit_name ?? ""); setAltTextDraft(attachment.alt_text ?? ""); setEditingMetadata(false); };

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
        onClick={() => { setHovered(null); onClick?.(index); }}
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

        {onEdit && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute left-2 top-2 z-10 rounded-full bg-background/90 px-3 font-semibold shadow-sm backdrop-blur"
            onClick={(e) => {
              e.stopPropagation();
              setHovered(null); onEdit(index);
            }}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        )}

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
        <div className={cn("space-y-2", size === "sm" ? "p-2" : "p-3")}>
          <p
            className={cn(
              "truncate font-medium",
              size === "sm" ? "text-xs" : "text-sm",
            )}
          >
            {attachment.file_name}
          </p>

          <div className="space-y-2">
            {editingMetadata ? (
              <>
                <Input
                  autoFocus
                  value={creditDraft}
                  placeholder="Credit name"
                  onChange={(e) => setCreditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); saveMetadata(); }
                    if (e.key === "Escape") { e.preventDefault(); cancelMetadata(); }
                  }}
                  className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
                />
                {isImage && <Input value={altTextDraft} placeholder="Alt text for this image" onChange={(e) => setAltTextDraft(e.target.value)} className="h-8 text-xs" />}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => { e.stopPropagation(); saveMetadata(); }}
                  aria-label="Save attachment metadata"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelMetadata();
                  }}
                  aria-label="Cancel metadata edit"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <button
                type="button"
                className="min-w-0 truncate text-left text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setHovered(null); setEditingMetadata(true);
                }}
              >
                {attachment.credit_name || "Add credit"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
