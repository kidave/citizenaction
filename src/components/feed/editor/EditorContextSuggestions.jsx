"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, Check, Loader2, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import EditorAddress from "./EditorAddress";
import ActionDatePicker, { formatActionDate } from "./ActionDatePicker";
import {
  extractDateCandidate,
  extractLocationCandidate,
} from "@/utils/editor/contextSuggestions";

function toValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractGovernanceCandidate(text) {
  const cleaned = String(text || "")
    .replace(/[.,!?;:)"'\]}]+$/g, "")
    .trim();

  if (!cleaned) return "";

  const match = cleaned.match(
    /(?:^|[\s([{"'])((?:[A-Z][\w.&'-]*|[A-Z]{2,})(?:\s+(?:[A-Z][\w.&'-]*|[A-Z]{2,})){0,2})$/,
  );

  return match?.[1]?.trim() || "";
}

export default function EditorContextSuggestions({ editor }) {
  const text = (editor.title || "") + "\n" + (editor.content || "");
  const dateCandidate = useMemo(() => extractDateCandidate(text), [text]);
  const locationCandidate = useMemo(
    () => extractLocationCandidate(text),
    [text],
  );
  const governanceCandidate = useMemo(
    () => extractGovernanceCandidate(text),
    [text],
  );

  const [dismissed, setDismissed] = useState({
    date: false,
    location: false,
    governance: false,
  });
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [locationEditorQuery, setLocationEditorQuery] = useState("");
  const [locationResult, setLocationResult] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [governanceSuggestions, setGovernanceSuggestions] = useState([]);
  const [governanceLoading, setGovernanceLoading] = useState(false);

  useEffect(() => {
    setDismissed({ date: false, location: false, governance: false });
    setLocationEditorQuery(locationCandidate?.query || "");
  }, [
    dateCandidate?.value,
    locationCandidate?.query,
    governanceCandidate,
  ]);

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
        const response = await fetch(
          "/api/osm?q=" + encodeURIComponent(query),
        );
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

  useEffect(() => {
    const query = governanceCandidate.trim();

    if (!query || dismissed.governance) {
      setGovernanceSuggestions([]);
      setGovernanceLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setGovernanceLoading(true);

      try {
        const pattern = "%" + query + "%";
        const [nameResult, shortNameResult] = await Promise.all([
          supabase
            .from("governance")
            .select("id,name,short_name,slug,image_url,type,status")
            .neq("status", "deleted")
            .ilike("name", pattern)
            .order("name")
            .limit(5),
          supabase
            .from("governance")
            .select("id,name,short_name,slug,image_url,type,status")
            .neq("status", "deleted")
            .ilike("short_name", pattern)
            .order("name")
            .limit(5),
        ]);

        if (cancelled) return;

        const rows = [
          ...(nameResult.data || []),
          ...(shortNameResult.data || []),
        ];

        if (nameResult.error && shortNameResult.error) {
          throw nameResult.error;
        }

        const selectedIds = new Set(
          (editor.governance || []).map((item) => item?.id).filter(Boolean),
        );

        const unique = Array.from(
          new Map(
            rows
              .filter((item) => item?.id && !selectedIds.has(item.id))
              .map((item) => [item.id, item]),
          ).values(),
        ).slice(0, 5);

        setGovernanceSuggestions(unique);
      } catch (error) {
        if (!cancelled) {
          console.warn("Governance suggestion failed", error);
          setGovernanceSuggestions([]);
        }
      } finally {
        if (!cancelled) setGovernanceLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dismissed.governance, editor.governance, governanceCandidate]);

  const validDateCandidate = useMemo(() => {
    if (!dateCandidate) return null;

    const value = toValidDate(dateCandidate.value);
    if (!value) return null;

    return {
      ...dateCandidate,
      value: value.toISOString(),
    };
  }, [dateCandidate]);

  const showDate = Boolean(
    validDateCandidate && !editor.start_at && !dismissed.date,
  );

  const showLocation = Boolean(
    locationCandidate &&
      !editor.address &&
      !dismissed.location &&
      locationResult,
  );

  const showGovernance =
    Boolean(governanceCandidate) &&
    !dismissed.governance &&
    (governanceLoading || governanceSuggestions.length > 0);

  if (
    !showDate &&
    !showLocation &&
    !showGovernance &&
    !locationEditorOpen
  ) {
    return null;
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
    setLocationEditorQuery(
      locationResult?.address ||
        locationCandidate?.query ||
        editor.address ||
        "",
    );
    setLocationEditorOpen(true);
  }

  function acceptGovernance(entity) {
    if (!entity?.id) return;

    const current = Array.isArray(editor.governance) ? editor.governance : [];
    if (current.some((item) => item?.id === entity.id)) return;

    editor.setSelectedAuthorities?.([...current, entity]);
    setGovernanceSuggestions([]);
    setDismissed((prev) => ({ ...prev, governance: true }));
  }

  const dateText = formatActionDate(
    validDateCandidate?.value,
    validDateCandidate?.precision || "date",
  );

  return (
    <>
      <div className="bg-muted/20 px-3 py-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {showDate && (
            <div className="flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">Use {dateText}?</span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={acceptDate}
                aria-label="Use suggested action date"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>

              <ActionDatePicker
                value={validDateCandidate.value}
                precision={validDateCandidate.precision || "date"}
                onChange={acceptEditedDate}
                showLabel
              />

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setDismissed((prev) => ({ ...prev, date: true }))
                }
                aria-label="Dismiss date suggestion"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {showGovernance && (
            <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-xs shadow-sm">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

              <span className="shrink-0 text-muted-foreground">
                Reference governance
              </span>

              {governanceLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <div className="flex min-w-0 items-center gap-1">
                  {governanceSuggestions.map((entity) => (
                    <Button
                      key={entity.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 max-w-[220px] justify-start px-2"
                      onClick={() => acceptGovernance(entity)}
                    >
                      <span className="truncate">
                        {entity.short_name || entity.name}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setDismissed((prev) => ({ ...prev, governance: true }))
                }
                aria-label="Dismiss governance suggestion"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {locationLoading &&
            locationCandidate &&
            !editor.address &&
            !dismissed.location && (
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
                <p className="truncate text-muted-foreground">
                  {locationResult.address}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={acceptLocation}
                aria-label="Use suggested location"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={openLocationPicker}
              >
                Edit
              </button>

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setDismissed((prev) => ({ ...prev, location: true }))
                }
                aria-label="Dismiss location suggestion"
              >
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
