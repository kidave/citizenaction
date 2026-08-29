"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MapPin, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LocationSearchInput({
  onSelect,
  onUseCurrentLocation,
  loadingGPS = false,
  value,
  onChange,
  onBack,
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/osm?q=${encodeURIComponent(query.trim())}`,
        );
        if (!res.ok) throw new Error(`Location search failed (${res.status})`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn("Location search failed", { message: error?.message });
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [query]);

  function handleChange(next) {
    setQuery(next);
    onChange?.(next);
  }

  function clearSearch() {
    handleChange("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back to map"
          className="shrink-0 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative min-w-0 flex-1">
          <Input
            autoFocus
            placeholder="Search location"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            className="h-11 rounded-full bg-muted/50 pr-10"
          />

          {query && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {results.map((place) => (
          <button
            key={`${place.lat}-${place.lon}-${place.osm_id ?? place.display_name}`}
            type="button"
            onClick={() =>
              onSelect({
                name: place.display_name,
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
                address: place.display_name,
              })
            }
            className="flex w-full items-start gap-4 border-b px-5 py-4 text-left transition-colors hover:bg-muted/60 active:bg-muted"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {place.name || place.display_name?.split(",")[0]}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                {place.display_name}
              </span>
            </span>
          </button>
        ))}

        {!loading && results.length === 0 && query.trim().length >= 3 && (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No locations found
          </div>
        )}

        {query.trim().length < 3 && (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center text-sm text-muted-foreground">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUseCurrentLocation}
            >
              {loadingGPS ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Use my location
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
