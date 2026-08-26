"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationSearchInput from "@/components/shared/LocationSearchInput";
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
  const locationCandidate = useMemo(() => extractLocationCandidate(text), [text]);
  const [dismissed, setDismissed] = useState({ date: false, location: false });
  const [editingDate, setEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    setDismissed({ date: false, location: false });
    setEditingDate(false);
    setEditingLocation(false);
    setDateValue(dateCandidate?.value ? toDateInputValue(dateCandidate.value) : "");
    setLocationQuery(locationCandidate?.query || "");
  }, [dateCandidate?.value, locationCandidate?.query]);

  useEffect(() => {
    if (!editingLocation || locationQuery.trim().length < 3) {
      setLocationResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLocationLoading(true);
        const response = await fetch(`/api/osm?q=${encodeURIComponent(locationQuery.trim())}`);
        if (!response.ok) throw new Error("Location search failed");
        const data = await response.json();
        setLocationResults(Array.isArray(data) ? data : []);
      } catch {
        setLocationResults([]);
      } finally {
        setLocationLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [editingLocation, locationQuery]);

  const showDate = Boolean(dateCandidate && !editor.start_at && !dismissed.date);
  const showLocation = Boolean(
    locationCandidate && !editor.address && !dismissed.location,
  );

  if (!showDate && !showLocation) return null;

  function acceptDate() {
    if (!dateValue) return;
    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);
    if (Number.isNaN(date.getTime())) return;
    editor.setStartAt(date.toISOString());
    setEditingDate(false);
  }

  function selectLocation(place) {
    const lat = Number(place.lat);
    const lng = Number(place.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    editor.setLat(lat);
    editor.setLng(lng);
    editor.setAddress(place.display_name || locationQuery);
    setEditingLocation(false);
    setLocationResults([]);
  }

  return (
    <div className="border-b bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap gap-2">
        {showDate && (
          <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-2 py-1.5 text-xs">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {editingDate ? (
              <>
                <Input
                  type="date"
                  value={dateValue}
                  onChange={(event) => setDateValue(event.target.value)}
                  className="h-7 w-[138px] px-2 text-xs"
                />
                <Button type="button" size="sm" className="h-7 px-2" onClick={acceptDate}>
                  Save
                </Button>
                <button type="button" className="text-muted-foreground" onClick={() => setEditingDate(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>Use {formatSuggestedDate(new Date(dateCandidate.value))}?</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={acceptDate} aria-label="Use suggested date">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <button type="button" className="text-muted-foreground" onClick={() => setEditingDate(true)}>
                  Edit
                </button>
                <button type="button" className="text-muted-foreground" onClick={() => setDismissed((prev) => ({ ...prev, date: true }))} aria-label="Dismiss date suggestion">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}

        {showLocation && (
          <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-2 py-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {!editingLocation ? (
              <>
                <span className="max-w-[280px] truncate">Use {locationCandidate.query}?</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingLocation(true)} aria-label="Choose suggested location">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <button type="button" className="text-muted-foreground" onClick={() => setEditingLocation(true)}>
                  Edit
                </button>
                <button type="button" className="text-muted-foreground" onClick={() => setDismissed((prev) => ({ ...prev, location: true }))} aria-label="Dismiss location suggestion">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="w-full sm:w-[420px]">
                <LocationSearchInput
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onSelect={selectLocation}
                  onUseCurrentLocation={() => {}}
                  loadingGPS={false}
                />
                {locationLoading && <div className="pt-1 text-[11px] text-muted-foreground">Searching...</div>}
                {locationResults.length > 0 && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-md border bg-background">
                    {locationResults.map((place) => (
                      <button
                        key={`${place.lat}-${place.lon}`}
                        type="button"
                        className="block w-full px-2 py-1.5 text-left text-xs hover:bg-muted"
                        onClick={() => selectLocation(place)}
                      >
                        {place.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
