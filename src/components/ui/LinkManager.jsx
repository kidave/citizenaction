"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabase/client";

import {
  detectLinkType,
  getHostname,
  getLinkTypeLabel,
  normalizeUrl,
} from "@/utils/text/detectLinkType";

import { useIsMobile } from "@/hooks/use-mobile";

function createFallbackLink(url) {
  const normalizedUrl = normalizeUrl(url);

  return {
    url: normalizedUrl,
    type: detectLinkType(normalizedUrl),
    title: null,
    description: null,
    hostname: getHostname(normalizedUrl),
    image_url: null,
    icon_url: null,
    provider_name: null,
    provider_url: null,
    sort_order: 0,
  };
}

export default function LinkManager({ value = [], onChange }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [links, setLinks] = useState(Array.isArray(value) ? value : []);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setLinks(Array.isArray(value) ? value : []);
  }, [value]);

  async function resolveLink(url) {
    setResolving(true);

    try {
      const { data, error } = await supabase.functions.invoke("resolve-link", {
        body: { url },
      });

      if (error) throw error;
      if (!data?.link) throw new Error("No link data returned");

      return data.link;
    } catch (error) {
      console.error("Failed to resolve link:", error);
      return createFallbackLink(url);
    } finally {
      setResolving(false);
    }
  }

  async function handleAdd() {
    if (resolving) return;

    const url = normalizeUrl(draft);
    if (!url) return;

    try {
      new URL(url);
    } catch {
      return;
    }

    const alreadyExists = links.some((link) => normalizeUrl(link.url) === url);

    if (alreadyExists) {
      setDraft("");
      return;
    }

    const resolvedLink = await resolveLink(url);
    const nextLinks = [
      ...links,
      {
        ...resolvedLink,
        sort_order: links.length,
      },
    ];

    setLinks(nextLinks);
    onChange?.(nextLinks);
    setDraft("");
  }

  function handleRemove(index) {
    const nextLinks = links
      .filter((_, i) => i !== index)
      .map((link, sort_order) => ({ ...link, sort_order }));

    setLinks(nextLinks);
    onChange?.(nextLinks);
  }

  function moveLink(from, to) {
    if (to < 0 || to >= links.length) return;

    const nextLinks = [...links];
    const [item] = nextLinks.splice(from, 1);
    nextLinks.splice(to, 0, item);

    const normalizedLinks = nextLinks.map((link, sort_order) => ({
      ...link,
      sort_order,
    }));

    setLinks(normalizedLinks);
    onChange?.(normalizedLinks);
  }

  function handleClear() {
    setLinks([]);
    onChange?.([]);
  }

  function LinkRow({ link, index }) {
    const previewImage = link.image_url || link.icon_url;

    return (
      <div className="overflow-hidden rounded-xl border">
        <div className="flex min-w-0 items-center gap-3 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {link.icon_url ? (
              <img
                src={link.icon_url}
                alt=""
                className="h-5 w-5 object-contain"
              />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {link.title || getLinkTypeLabel(link.type)}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {link.hostname || getHostname(link.url)}
            </div>
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

            <div className="hidden flex-col sm:flex">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={index === 0}
                onClick={() => moveLink(index, index - 1)}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={index === links.length - 1}
                onClick={() => moveLink(index, index + 1)}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              aria-label="Remove link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {link.image_url && previewImage ? (
          <div className="border-t bg-muted/20">
            <img
              src={link.image_url}
              alt={link.title || "Link preview"}
              className="h-28 w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    );
  }

  const content = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 border-b p-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            disabled={resolving}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (!resolving) handleAdd();
              }
            }}
            placeholder="https://..."
            className="min-w-0 flex-1"
          />

          <Button
            type="button"
            onClick={handleAdd}
            disabled={!draft.trim() || resolving}
            className="shrink-0"
          >
            {resolving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Resolving...</span>
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          YouTube, Vimeo, Zoom, Google Meet, Maps and other websites are
          automatically recognized.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {links.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm font-medium">Links</div>

            <div className="space-y-2">
              {links.map((link, index) => (
                <LinkRow
                  key={link.id ?? `${link.url}-${index}`}
                  link={link}
                  index={index}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleClear}
            >
              <X className="mr-2 h-4 w-4" />
              Remove all links
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No links added yet.
          </div>
        )}
      </div>

      <div className="shrink-0 border-t p-4">
        <Button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full sm:ml-auto sm:flex sm:w-auto"
        >
          <Check className="mr-2 h-4 w-4" />
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative shrink-0"
              onClick={() => setOpen(true)}
            >
              <Link2 className="h-4 w-4" />
              {links.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {links.length}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Manage links</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-lg">
          <DialogHeader className="shrink-0 border-b p-5">
            <DialogTitle>Add links</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
}
