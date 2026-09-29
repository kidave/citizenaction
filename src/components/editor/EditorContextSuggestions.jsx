"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Loader2, MapPin, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EditorAddress from "@/components/editor/EditorAddress";
import ActionDatePicker, { formatActionDate } from "@/components/calendar/ActionDatePicker";
import { extractDateCandidate, extractLocationCandidate } from "@/utils/editor/contextSuggestions";

function toValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function EditorContextSuggestions({ editor, resolvedContext = null }) {
  const text = (editor.title || "") + "\n" + (editor.content || "");
  const dateCandidate = useMemo(() => extractDateCandidate(text), [text]);
  const locationCandidate = useMemo(() => extractLocationCandidate(text), [text]);
  const [dismissed, setDismissed] = useState({ date: false, location: false, contexts: new Set() });
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [locationEditorQuery, setLocationEditorQuery] = useState("");
  const [locationResult, setLocationResult] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    setDismissed((prev) => ({ ...prev, date: false, location: false }));
    setLocationEditorQuery(locationCandidate?.query || "");
  }, [dateCandidate?.value, locationCandidate?.query]);

  useEffect(() => {
    const query = locationCandidate?.query?.trim();
    if (!query || editor.address || dismissed.location) {
      setLocationResult(null);
      setLocationLoading(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLocationLoading(true);
      try {
        const response = await fetch("/api/osm?q=" + encodeURIComponent(query));
        if (!response.ok) return;
        const data = await response.json();
        const first = Array.isArray(data) ? data[0] : data?.results?.[0];
        if (!first || cancelled) return;
        const lat = Number(first.lat);
        const lng = Number(first.lon ?? first.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setLocationResult({
          name: first.name || first.display_name?.split(",")[0] || query,
          address: first.display_name || first.address || query,
          lat,
          lng,
        });
      } catch (error) {
        if (!cancelled) console.warn("Location suggestion failed", error);
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dismissed.location, editor.address, locationCandidate?.query]);

  const validDateCandidate = useMemo(() => {
    if (!dateCandidate) return null;
    const value = toValidDate(dateCandidate.value);
    return value ? { ...dateCandidate, value: value.toISOString() } : null;
  }, [dateCandidate]);

  const suggestedPeople = (resolvedContext?.people ?? []).filter((p) => !dismissed.contexts.has(`person:${p.id}`));
  const suggestedGovernance = (resolvedContext?.governance ?? []).filter((o) => !dismissed.contexts.has(`governance:${o.id}`));
  const suggestedCategories = (resolvedContext?.categories ?? []).filter((c) => !dismissed.contexts.has(`category:${c.id}`));
  const contextCount = suggestedPeople.length + suggestedGovernance.length + suggestedCategories.length;
  const showDate = Boolean(validDateCandidate && !editor.start_at && !dismissed.date);
  const showLocation = Boolean(locationCandidate && !editor.address && !dismissed.location && locationResult);

  if (!showDate && !showLocation && contextCount === 0 && !locationEditorOpen) return null;

  function dismissContext(type, id) {
    setDismissed((prev) => ({ ...prev, contexts: new Set([...prev.contexts, `${type}:${id}`]) }));
  }

  function acceptDate() {
    if (!validDateCandidate) return;
    editor.setStartAt(validDateCandidate.value);
    editor.setEndAt(null);
    editor.setDatePrecision?.(validDateCandidate.precision || "date");
    setDismissed((prev) => ({ ...prev, date: true }));
  }

  function acceptEditedDate({ value, precision }) {
    editor.setStartAt(value);
    editor.setEndAt(null);
    editor.setDatePrecision?.(precision);
    setDismissed((prev) => ({ ...prev, date: true }));
  }

  function acceptLocation() {
    if (!locationResult) return;
    editor.setLat(locationResult.lat);
    editor.setLng(locationResult.lng);
    editor.setAddress(locationResult.address);
  }

  function openLocationPicker() {
    setLocationEditorQuery(locationResult?.address || locationCandidate?.query || editor.address || "");
    setLocationEditorOpen(true);
  }

  const dateText = formatActionDate(validDateCandidate?.value, validDateCandidate?.precision || "date");

  return (
    <>
      <div className="bg-muted/20 px-3 py-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {contextCount > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Context
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none">{contextCount}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={8} className="w-[min(92vw,360px)] p-0">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-medium">Context suggestions</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">We found useful context in your content.</p>
                </div>

                <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
                  {suggestedGovernance.length > 0 && (
                    <div className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Governance</div>
                  )}
                  {suggestedGovernance.map((org) => (
                    <div key={`governance-${org.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={org.image_url || undefined} alt="" />
                        <AvatarFallback className="text-[10px]">{initials(org.short_name || org.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{org.short_name || org.name}</p>
                        <p className="text-xs text-muted-foreground">Governance organization</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => dismissContext("governance", org.id)} aria-label={`Dismiss ${org.name}`}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  {suggestedPeople.length > 0 && (
                    <div className="px-2 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">People</div>
                  )}
                  {suggestedPeople.map((person) => (
                    <div key={`person-${person.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={person.image_url || undefined} alt="" />
                        <AvatarFallback className="text-[10px]">{initials(person.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{person.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{person.position_name || "Person mentioned"}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => dismissContext("person", person.id)} aria-label={`Dismiss ${person.name}`}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  {suggestedCategories.length > 0 && (
                    <div className="px-2 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Categories</div>
                  )}
                  {suggestedCategories.map((category) => (
                    <div key={`category-${category.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">#</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">Suggested category</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => dismissContext("category", category.id)} aria-label={`Dismiss ${category.name}`}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {showDate && (
            <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">Use {dateText}?</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={acceptDate} aria-label="Use suggested action date">
                <Check className="h-3.5 w-3.5" />
              </Button>
              <ActionDatePicker value={validDateCandidate.value} precision={validDateCandidate.precision || "date"} onChange={acceptEditedDate} showLabel />
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setDismissed((prev) => ({ ...prev, date: true }))} aria-label="Dismiss date suggestion">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {locationLoading && locationCandidate && !editor.address && !dismissed.location && (
            <div className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm">
              <MapPin className="h-3.5 w-3.5" />
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Finding {locationCandidate.query}…
            </div>
          )}

          {showLocation && (
            <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 max-w-[280px]">
                <p className="truncate font-medium">{locationResult.name}</p>
                <p className="truncate text-muted-foreground">{locationResult.address}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={acceptLocation} aria-label="Use suggested location">
                <Check className="h-3.5 w-3.5" />
              </Button>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={openLocationPicker}>Edit</button>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setDismissed((prev) => ({ ...prev, location: true }))} aria-label="Dismiss location suggestion">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <EditorAddress editor={editor} openOverride={locationEditorOpen} initialQuery={locationEditorQuery} onOpenChange={setLocationEditorOpen} />
    </>
  );
}
