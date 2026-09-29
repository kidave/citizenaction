"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditorAddress from "@/components/editor/EditorAddress";
import ActionDatePicker, { formatActionDate } from "@/components/calendar/ActionDatePicker";
import { extractDateCandidate, extractLocationCandidate } from "@/utils/editor/contextSuggestions";

function toValidDate(value) { if (!value) return null; const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
function initials(name = "") { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

export default function EditorContextSuggestions({ editor, resolvedContext = null }) {
  const text = (editor.title || "") + "\n" + (editor.content || "");
  const dateCandidate = useMemo(() => extractDateCandidate(text), [text]);
  const locationCandidate = useMemo(() => extractLocationCandidate(text), [text]);
  const [dismissed, setDismissed] = useState({ date: false, location: false, contexts: new Set() });
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [locationEditorQuery, setLocationEditorQuery] = useState("");
  const [locationResult, setLocationResult] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Do not reset context dismissals when the text changes. An X only dismisses
  // that individual suggestion for the current editor session.
  useEffect(() => {
    setDismissed((prev) => ({ ...prev, date: false, location: false }));
    setLocationEditorQuery(locationCandidate?.query || "");
  }, [dateCandidate?.value, locationCandidate?.query]);

  useEffect(() => {
    const query = locationCandidate?.query?.trim();
    if (!query || editor.address || dismissed.location) { setLocationResult(null); setLocationLoading(false); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLocationLoading(true);
      try {
        const response = await fetch("/api/osm?q=" + encodeURIComponent(query));
        if (!response.ok) return;
        const data = await response.json(); const first = Array.isArray(data) ? data[0] : data?.results?.[0];
        if (!first || cancelled) return;
        const lat = Number(first.lat); const lng = Number(first.lon ?? first.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setLocationResult({ name: first.name || first.display_name?.split(",")[0] || query, address: first.display_name || first.address || query, lat, lng });
      } catch (error) { if (!cancelled) console.warn("Location suggestion failed", error); }
      finally { if (!cancelled) setLocationLoading(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [dismissed.location, editor.address, locationCandidate?.query]);

  const validDateCandidate = useMemo(() => { if (!dateCandidate) return null; const value = toValidDate(dateCandidate.value); return value ? { ...dateCandidate, value: value.toISOString() } : null; }, [dateCandidate]);
  const suggestedPeople = (resolvedContext?.people ?? []).filter((p) => !dismissed.contexts.has(`person:${p.id}`));
  const suggestedGovernance = (resolvedContext?.governance ?? []).filter((o) => !dismissed.contexts.has(`governance:${o.id}`));
  const suggestedCategories = (resolvedContext?.categories ?? []).filter((c) => c.source !== "content" && !dismissed.contexts.has(`category:${c.id}`));
  const district = resolvedContext?.district ?? null;
  const showEntities = suggestedPeople.length > 0 || suggestedGovernance.length > 0;
  const showCategories = suggestedCategories.length > 0;
  const showDistrict = Boolean(editor.address && district?.name);
  const showDate = Boolean(validDateCandidate && !editor.start_at && !dismissed.date);
  const showLocation = Boolean(locationCandidate && !editor.address && !dismissed.location && locationResult);

  if (!showDate && !showLocation && !showEntities && !showCategories && !locationEditorOpen) return null;

  function dismissContext(type, id) { setDismissed((prev) => ({ ...prev, contexts: new Set([...prev.contexts, `${type}:${id}`]) })); }
  function acceptDate() { if (!validDateCandidate) return; editor.setStartAt(validDateCandidate.value); editor.setEndAt(null); editor.setDatePrecision?.(validDateCandidate.precision || "date"); setDismissed((prev) => ({ ...prev, date: true })); }
  function acceptEditedDate({ value, precision }) { editor.setStartAt(value); editor.setEndAt(null); editor.setDatePrecision?.(precision); setDismissed((prev) => ({ ...prev, date: true })); }
  function acceptLocation() { if (!locationResult) return; editor.setLat(locationResult.lat); editor.setLng(locationResult.lng); editor.setAddress(locationResult.address); }
  function openLocationPicker() { setLocationEditorQuery(locationResult?.address || locationCandidate?.query || editor.address || ""); setLocationEditorOpen(true); }
  const dateText = formatActionDate(validDateCandidate?.value, validDateCandidate?.precision || "date");

  return <>
    <div className="bg-muted/20 px-3 py-1.5"><div className="flex min-w-0 flex-wrap items-center gap-2">
      {showCategories && <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm"><span className="font-medium">Context</span><div className="flex flex-wrap items-center gap-1">{suggestedCategories.slice(0, 5).map((category) => <span key={category.id} className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">{category.name}<button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => dismissContext("category", category.id)} aria-label={`Dismiss ${category.name}`}><X className="h-3 w-3" /></button></span>)}</div></div>}
      {showEntities && <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm"><span className="font-medium">Entities</span><div className="flex min-w-0 flex-wrap items-center gap-2">
        {suggestedGovernance.slice(0, 3).map((org) => <span key={org.id} className="inline-flex items-center gap-1.5 rounded bg-muted px-1.5 py-0.5"><Avatar className="h-5 w-5"><AvatarImage src={org.image_url || undefined} alt="" /><AvatarFallback className="text-[9px]">{initials(org.short_name || org.name)}</AvatarFallback></Avatar><span>{org.short_name || org.name}</span><button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => dismissContext("governance", org.id)} aria-label={`Dismiss ${org.name}`}><X className="h-3 w-3" /></button></span>)}
        {suggestedPeople.slice(0, 4).map((person) => <span key={person.id} className="inline-flex items-center gap-1.5 rounded bg-muted px-1.5 py-0.5"><Avatar className="h-5 w-5"><AvatarImage src={person.image_url || undefined} alt="" /><AvatarFallback className="text-[9px]">{initials(person.name)}</AvatarFallback></Avatar><span>{person.name}{person.position_name ? ` · ${person.position_name}` : ""}</span><button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => dismissContext("person", person.id)} aria-label={`Dismiss ${person.name}`}><X className="h-3 w-3" /></button></span>)}
      </div></div>}
      {showDate && <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm"><CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><span className="truncate">Use {dateText}?</span><Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={acceptDate} aria-label="Use suggested action date"><Check className="h-3.5 w-3.5" /></Button><ActionDatePicker value={validDateCandidate.value} precision={validDateCandidate.precision || "date"} onChange={acceptEditedDate} showLabel /><button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setDismissed((prev) => ({ ...prev, date: true }))} aria-label="Dismiss date suggestion"><X className="h-3.5 w-3.5" /></button></div>}
      {locationLoading && locationCandidate && !editor.address && !dismissed.location && <div className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm"><MapPin className="h-3.5 w-3.5" /><Loader2 className="h-3.5 w-3.5 animate-spin" />Finding {locationCandidate.query}…</div>}
      {showLocation && <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm"><MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><div className="min-w-0 max-w-[280px]"><p className="truncate font-medium">{locationResult.name}</p><p className="truncate text-muted-foreground">{locationResult.address}</p></div><Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={acceptLocation} aria-label="Use suggested location"><Check className="h-3.5 w-3.5" /></Button><button type="button" className="text-muted-foreground hover:text-foreground" onClick={openLocationPicker}>Edit</button><button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setDismissed((prev) => ({ ...prev, location: true }))} aria-label="Dismiss location suggestion"><X className="h-3.5 w-3.5" /></button></div>}
    </div></div>
    <EditorAddress editor={editor} openOverride={locationEditorOpen} initialQuery={locationEditorQuery} onOpenChange={setLocationEditorOpen} />
  </>;
}
