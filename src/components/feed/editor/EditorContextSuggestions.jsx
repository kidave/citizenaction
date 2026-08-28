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

function toValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateTimeLocalValue(value) {
  const date = toValidDate(value);
  if (!date) return "";

  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateRange(start, end) {
  const startDate = toValidDate(start);
  if (!startDate) return "";

  const endDate = toValidDate(end);
  if (!endDate) return formatSuggestedDate(startDate);

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    return `${startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })} → ${endDate.toLocaleDateString("en-IN", { day: "numeric", year: "numeric" })}`;
  }

  if (sameYear) {
    return `${startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })} → ${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
  }

  return `${formatSuggestedDate(startDate)} → ${formatSuggestedDate(endDate)}`;
}

function formatMonthInputValue(value) {
  const date = toValidDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
  const [monthValue, setMonthValue] = useState("");
  const [dateEndValue, setDateEndValue] = useState("");
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [locationEditorQuery, setLocationEditorQuery] = useState("");
  const [locationResult, setLocationResult] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    setDismissed({ date: false, location: false });
    setEditingDate(false);
    setLocationEditorQuery(locationCandidate?.query || "");

    setDateValue(toDateTimeLocalValue(dateCandidate?.value));
    setMonthValue(formatMonthInputValue(dateCandidate?.value));
    setDateEndValue(toDateTimeLocalValue(dateCandidate?.endValue));
  }, [dateCandidate?.value, dateCandidate?.endValue, locationCandidate?.query]);

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

  const validDateCandidate = useMemo(() => {
    if (!dateCandidate) return null;
    const value = toValidDate(dateCandidate.value);
    if (!value) return null;
    return {
      ...dateCandidate,
      value: value.toISOString(),
      endValue: toValidDate(dateCandidate.endValue)?.toISOString() || null,
    };
  }, [dateCandidate]);

  const showDate = Boolean(validDateCandidate && !editor.start_at && !dismissed.date);
  const showLocation = Boolean(
    locationCandidate && !editor.address && !dismissed.location && locationResult,
  );

  if (!showDate && !showLocation && !locationEditorOpen) return null;

  function acceptDate() {
    if (!validDateCandidate) return;

    if (validDateCandidate.precision === "month") {
      if (!monthValue) return;
      const [year, month] = monthValue.split("-").map(Number);
      if (!year || !month) return;

      const firstDay = new Date(year, month - 1, 1, 12, 0, 0, 0);
      const lastDay = new Date(year, month, 0, 23, 59, 59, 999);

      editor.setStartAt(firstDay.toISOString());
      editor.setEndAt(lastDay.toISOString());
      editor.setDatePrecision?.("month");
      setEditingDate(false);
      return;
    }

    const date = toValidDate(dateValue);
    if (!date) return;

    editor.setStartAt(date.toISOString());

    const endDate = toValidDate(dateEndValue || validDateCandidate.endValue);
    if (endDate && endDate >= date) {
      editor.setEndAt(endDate.toISOString());
    }

    editor.setDatePrecision?.(validDateCandidate.precision || "date");
    setEditingDate(false);
  }

  function acceptLocation() {
    if (!locationResult) return;

    editor.setLat(locationResult.lat);
    editor.setLng(locationResult.lng);
    editor.setAddress(locationResult.address);
  }

  function openLocationPicker() {
    setLocationEditorQuery(
      locationResult?.address || locationCandidate?.query || editor.address || "",
    );
    setLocationEditorOpen(true);
  }

  const dateSuggestionText =
    validDateCandidate?.precision === "month"
      ? validDateCandidate.label
      : formatDateRange(validDateCandidate?.value, validDateCandidate?.endValue);

  const isMonthSuggestion = validDateCandidate?.precision === "month";

  return (
    <>
      <div className="border-b bg-muted/20 px-3 py-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {showDate && (
            <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {editingDate ? (
                <>
                  {isMonthSuggestion ? (
                    <Input
                      type="month"
                      value={monthValue}
                      onChange={(event) => setMonthValue(event.target.value)}
                      className="h-7 w-[150px] px-2 text-xs"
                    />
                  ) : (
                    <>
                      <Input
                        type="datetime-local"
                        value={dateValue}
                        onChange={(event) => setDateValue(event.target.value)}
                        className="h-7 w-[190px] px-2 text-xs"
                      />
                      {validDateCandidate?.endValue && (
                        <Input
                          type="datetime-local"
                          value={dateEndValue}
                          onChange={(event) => setDateEndValue(event.target.value)}
                          className="h-7 w-[190px] px-2 text-xs"
                        />
                      )}
                    </>
                  )}
                  <Button type="button" size="sm" className="h-7 px-2" onClick={acceptDate}>
                    Save
                  </Button>
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setEditingDate(false)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>Use {dateSuggestionText}?</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={acceptDate} aria-label="Use suggested date">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setEditingDate(true)}>
                    Edit
                  </button>
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
