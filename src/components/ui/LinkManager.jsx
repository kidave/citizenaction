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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabase/client";

import {
  detectLinkType,
  getHostname,
  getLinkTypeLabel,
  normalizeUrl,
} from "@/utils/text/detectLinkType";

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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [links, setLinks] = useState(Array.isArray(value) ? value : []);

  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setLinks(Array.isArray(value) ? value : []);
  }, [value]);

  // ==========================================================
  // Resolve link through Edge Function
  // ==========================================================

  async function resolveLink(url) {
    setResolving(true);

    try {
      const { data, error } = await supabase.functions.invoke("resolve-link", {
        body: {
          url,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.link) {
        throw new Error("No link data returned");
      }

      return data.link;
    } catch (error) {
      // --------------------------------------------------------
      // Fallback
      //
      // We still allow the user to add the URL even if
      // oEmbed/resolution fails.
      // --------------------------------------------------------

      return createFallbackLink(url);
    } finally {
      // IMPORTANT:
      // This guarantees "Resolving..." never gets stuck.
      setResolving(false);
    }
  }

  // ==========================================================
  // Add
  // ==========================================================

  async function handleAdd() {
    if (resolving) return;

    const url = normalizeUrl(draft);

    if (!url) {
      return;
    }

    try {
      new URL(url);
    } catch {
      return;
    }

    // Prevent duplicate URLs
    const alreadyExists = links.some((link) => normalizeUrl(link.url) === url);

    if (alreadyExists) {
      setDraft("");
      return;
    }

    try {
      const resolvedLink = await resolveLink(url);

      const newLink = {
        ...resolvedLink,
        sort_order: links.length,
      };

      const nextLinks = [...links, newLink];

      setLinks(nextLinks);
      onChange?.(nextLinks);
      setDraft("");
    } catch (error) {
      console.error("Failed to add link:", error);
    }
  }

  // ==========================================================
  // Remove
  // ==========================================================

  function handleRemove(index) {
    const nextLinks = links
      .filter((_, i) => i !== index)
      .map((link, index) => ({
        ...link,
        sort_order: index,
      }));

    setLinks(nextLinks);
    onChange?.(nextLinks);
  }

  // ==========================================================
  // Move
  // ==========================================================

  function moveLink(from, to) {
    if (to < 0 || to >= links.length) {
      return;
    }

    const nextLinks = [...links];

    const [item] = nextLinks.splice(from, 1);

    nextLinks.splice(to, 0, item);

    const normalizedLinks = nextLinks.map((link, index) => ({
      ...link,
      sort_order: index,
    }));

    setLinks(normalizedLinks);
    onChange?.(normalizedLinks);
  }

  // ==========================================================
  // Clear
  // ==========================================================

  function handleClear() {
    setLinks([]);
    onChange?.([]);
  }

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative shrink-0"
        >
          <Link2 className="h-4 w-4" />

          {links.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {links.length}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add links</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ================================================= */}
          {/* Add URL */}
          {/* ================================================= */}

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={draft}
                disabled={resolving}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    if (!resolving) {
                      handleAdd();
                    }
                  }
                }}
                placeholder="https://..."
                className="flex-1"
              />

              <Button
                type="button"
                onClick={handleAdd}
                disabled={!draft.trim() || resolving}
              >
                {resolving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resolving...
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

          {/* ================================================= */}
          {/* Links */}
          {/* ================================================= */}

          {links.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Links</div>

              <div className="space-y-2">
                {links.map((link, index) => (
                  <div
                    key={link.id ?? `${link.url}-${index}`}
                    className="flex items-center gap-2 rounded-xl border p-3"
                  >
                    {/* Provider icon */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
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

                    {/* Content */}

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {link.title || getLinkTypeLabel(link.type)}
                      </div>

                      <div className="truncate text-xs text-muted-foreground">
                        {link.hostname || getHostname(link.url)}
                      </div>

                      <div className="truncate text-xs text-muted-foreground">
                        {link.url}
                      </div>
                    </div>

                    {/* Open */}

                    <Button type="button" variant="ghost" size="icon" asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>

                    {/* Move */}

                    <div className="flex flex-col">
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

                    {/* Remove */}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No links added yet.
            </div>
          )}

          {/* ================================================= */}
          {/* Done */}
          {/* ================================================= */}

          <div className="flex justify-end">
            <Button type="button" onClick={() => setOpen(false)}>
              <Check className="mr-2 h-4 w-4" />
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
