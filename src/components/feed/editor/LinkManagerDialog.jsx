"use client";

import { Check, Loader2, Plus, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import LinkRow from "@/components/feed/editor/LinkRow";

export default function LinkManagerDialog({
  open,
  onOpenChange,

  links,
  draft,
  setDraft,

  resolving,

  addLink,
  removeLink,
  moveLink,
  clearLinks,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[75vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {/* Header */}

        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle>Add links</DialogTitle>
        </DialogHeader>

        {/* Add */}

        <div className="shrink-0 space-y-2 px-5 py-4">
          <div className="flex gap-2">
            <Input
              value={draft}
              disabled={resolving}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();

                  if (!resolving) {
                    addLink();
                  }
                }
              }}
              placeholder="https://..."
              className="min-w-0 flex-1"
            />

            <Button
              type="button"
              onClick={addLink}
              disabled={!draft.trim() || resolving}
              className="shrink-0"
            >
              {resolving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                {resolving ? "Resolving..." : "Add"}
              </span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Add a URL to automatically detect its type and metadata.
          </p>
        </div>

        {/* List */}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          {links.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Links</div>

              {links.map((link, index) => (
                <LinkRow
                  key={link.id ?? `${link.url}-${index}`}
                  link={link}
                  index={index}
                  total={links.length}
                  onMove={moveLink}
                  onRemove={removeLink}
                />
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive"
                onClick={clearLinks}
              >
                <X className="mr-2 h-4 w-4" />
                Remove all links
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No links added yet.
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex shrink-0 justify-end border-t px-5 py-4">
          <Button type="button" onClick={() => onOpenChange(false)}>
            <Check className="mr-2 h-4 w-4" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
