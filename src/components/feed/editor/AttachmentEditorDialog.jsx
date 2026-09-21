"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AttachmentPreview from "@/components/attachment/AttachmentPreview";

export default function AttachmentEditorDialog({
  attachments = [],
  open,
  index = 0,
  onOpenChange,
  onChange,
  onRemove,
  onIndexChange,
}) {
  const [draft, setDraft] = useState(null);

  const current = attachments[index] ?? null;

  useEffect(() => {
    if (!current) {
      setDraft(null);
      return;
    }

    setDraft({
      credit_name: current.credit_name ?? "",
      description: current.description ?? "",
    });
  }, [current?.id, open]);

  const canNavigate = attachments.length > 1;

  const save = () => {
    if (!current || !draft) return;

    onChange?.(index, {
      credit_name: draft.credit_name.trim(),
      description: draft.description.trim(),
    });

    onOpenChange?.(false);
  };

  const remove = () => {
    if (!current) return;
    onRemove?.(index);
    onOpenChange?.(false);
  };

  const go = (direction) => {
    if (!canNavigate) return;

    const next =
      direction === "next"
        ? (index + 1) % attachments.length
        : (index - 1 + attachments.length) % attachments.length;

    if (draft) {
      onChange?.(index, {
        credit_name: draft.credit_name.trim(),
        description: draft.description.trim(),
      });
    }

    onIndexChange?.(next);
  };

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[calc(100%-1rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:h-[86vh] sm:w-[calc(100%-2rem)] sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-base">
              Edit attachment {index + 1} of {attachments.length}
            </DialogTitle>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!canNavigate}
                onClick={() => go("previous")}
                aria-label="Previous attachment"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!canNavigate}
                onClick={() => go("next")}
                aria-label="Next attachment"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={remove}
                aria-label="Remove attachment"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-h-0 items-center justify-center bg-black p-4">
            <div className="max-h-full max-w-full overflow-hidden rounded-lg">
              <AttachmentPreview attachment={current} />
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto border-t p-4 md:border-l md:border-t-0 sm:p-5">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold">Attachment details</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep only the context that helps people understand the resource.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Credit</label>
                <Input
                  value={draft?.credit_name ?? ""}
                  onChange={(event) =>
                    setDraft((value) => ({
                      ...value,
                      credit_name: event.target.value,
                    }))
                  }
                  placeholder="Add credit"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={draft?.description ?? ""}
                  onChange={(event) =>
                    setDraft((value) => ({
                      ...value,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Briefly describe this resource"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-4 py-3 sm:px-5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={save}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
