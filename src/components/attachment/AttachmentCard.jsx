"use client";

import { Check, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFileExtension, formatFileSize } from "@/utils/attachment";

import AttachmentPreview from "@/components/attachment/AttachmentPreview";
import { useEffect, useState } from "react";

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
  const [editingCredit, setEditingCredit] = useState(false);
  const [creditDraft, setCreditDraft] = useState(attachment.credit_name ?? "");

  useEffect(() => {
    if (!editingCredit) setCreditDraft(attachment.credit_name ?? "");
  }, [attachment.credit_name, editingCredit]);

  const saveCredit = () => {
    onCreditNameChange?.(index, creditDraft.trim());
    setEditingCredit(false);
  };

  const cancelCredit = () => {
    setCreditDraft(attachment.credit_name ?? "");
    setEditingCredit(false);
  };

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

      {showMetadata && (
        <div
          className={cn(
            "space-y-1.5 overflow-hidden",
            size === "sm" || size === "compact" ? "p-2" : "p-3",
          )}
        >
          <div className="flex h-7 min-w-0 items-center gap-1 overflow-hidden">
            {editingCredit ? (
              <>
                <Input
                  autoFocus
                  value={creditDraft}
                  placeholder="Add credit"
                  aria-label="Credit name"
                  onChange={(e) => setCreditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveCredit();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      cancelCredit();
                    }
                  }}
                  className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 md:text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveCredit();
                  }}
                  aria-label="Save credit"
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
                    cancelCredit();
                  }}
                  aria-label="Cancel credit edit"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <button
                type="button"
                className="h-7 min-w-0 flex-1 truncate text-left text-base leading-7 text-muted-foreground hover:text-foreground md:text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCredit(true);
                }}
              >
                {attachment.credit_name || "Add credit"}
              </button>
            )}
          </div>

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
