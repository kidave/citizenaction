"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHostname, getLinkTypeLabel } from "@/utils/text/detectLinkType";

export default function LinkRow({ link, index, total, onMove, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title ?? "");
  const [description, setDescription] = useState(link.description ?? "");

  const save = () => {
    onUpdate?.(index, {
      title: title.trim() || null,
      description: description.trim() || null,
    });
    setEditing(false);
  };

  const cancel = () => {
    setTitle(link.title ?? "");
    setDescription(link.description ?? "");
    setEditing(false);
  };

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {link.icon_url ? (
          <img src={link.icon_url} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link title"
              className="h-8 text-xs"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="h-8 text-xs"
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={cancel}
                aria-label="Cancel link edit"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={save}
                aria-label="Save link"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="truncate text-sm font-medium">
              {link.title || getLinkTypeLabel(link.type)}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {link.hostname || getHostname(link.url)}
            </div>
          </>
        )}
      </div>

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

        {!editing && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setEditing(true)}
            aria-label="Edit link"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

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
