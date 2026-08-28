"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Loader2, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditorAddress from "./EditorAddress";
import {
  extractDateCandidate,
  extractLocationCandidate,
  formatSuggestedDate,
} from "@/utils/editor/contextSuggestions";

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function EditorContextSuggestions({ editor }) {
  const text = `${editor.title || ""}\n${editor.content || ""}`;
  const dateCandidate = useMemo(() => extractDateCandidate(text), [text]);
  const locationCandidate = useMemo(
    () => extractLocationCandidate(text),
    [text],
  );

  const [dismissed, setDismissed] = useState({ date: false, location: false });
  const [editingDate, setEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [locationEditorQuery, setLocationEditorQuery] = useState("");
  const [locationResult, setLocationResult] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    setDismissed({ date: false, location: false });
    setEditingDate(false);
    setLocationEditorQuery(locationCandidate?.query || "");
    setDateValue(
      dateCandidate?.value ? toDateInputValue(dateCandidate.value) : "",
    );
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
        const response = await fetch(`/api/osm?q=${encodeURIComponent(query)}`);
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

  const showDate = Boolean(
    dateCandidate && !editor.start_at && !dismissed.date,
  );

  const showLocation = Boolean(
    locationCandidate && !editor.address && !dismissed.location && locationResult,
  );

  if (!showDate && !showLocation && !locationEditorOpen) return null;

  function acceptDate() {
    if (!dateValue) return;

    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);

    if (Number.isNaN(date.getTime())) return;

    editor.setStartAt(date.toISOString());
    setEditingDate(false);
  }

  function acceptLocation() {
    if (!locationResult) return;

    editor.setLat(locationResult.lat);
    editor.setLng(locationResult.lng);
    editor.setAddress(locationResult.address);
    setLocationEditorOpen(false);
  }

  function openLocationPicker() {
    setLocationEditorQuery(locationResult?.address || locationCandidate?.query || editor.address || "");
    setLocationEditorOpen(true);
  }

  return (
    <>
      <div className="border-b bg-muted/20 px-3 py-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {showDate && (
            <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {editingDate ? (
                <>
                  <Input type="date" value={dateValue} onChange={(event) => setDateValue(event.target.value)} className="h-7 w-[138px] px-2 text-xs" />
                  <Button type="button" size="sm" className="h-7 px-2" onClick={acceptDate}>Save</Button>
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setEditingDate(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <span>Use {formatSuggestedDate(new Date(dateCandidate.value))}?</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={acceptDate} aria-label="Use suggested date">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setEditingDate(true)}>Edit</button>
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setDismissed((prev) => ({ ...prev, date: true }))} aria-label="Dismiss date suggestion">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
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

      <EditorAddress
        editor={editor}
        openOverride={locationEditorOpen}
        initialQuery={locationEditorQuery}
        onOpenChange={setLocationEditorOpen}
      />
    </>
  );
}
