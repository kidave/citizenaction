"use client";

import {
  useEffect,
  useState,
} from "react";

import { Input } from "@/components/ui/input";

import {
  MapPin,
  LocateFixed,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LocationSearchInput({
  onSelect,
  onUseCurrentLocation,
  loadingGPS = false,
  value,
  onChange,
}) {
  const [query, setQuery] =
    useState(value || "");

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // SYNC
  // =====================================================

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {

    if (query.length < 3) {
      setResults([]);
      return;
    }

    const delay =
      setTimeout(async () => {

        try {

          setLoading(true);

          const res =
            await fetch(
              `/api/osm?q=${encodeURIComponent(query)}`
            );

          const data =
            await res.json();

          setResults(
            data || []
          );

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);

        }

      }, 400);

    return () =>
      clearTimeout(delay);

  }, [query]);

  return (
    <div className="flex flex-col h-full">

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 mb-2">

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={
            onUseCurrentLocation
          }
        >

          {loadingGPS ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}

        </Button>

        <div className="relative flex-1">

          <Input
            placeholder="Search location"
            value={query}
            onChange={(e) => {

              const val =
                e.target.value;

              setQuery(val);

              onChange?.(val);

            }}
            className="pr-9"
          />

          {loading && (
            <Loader2
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2

                w-4
                h-4
                animate-spin
                text-muted-foreground
              "
            />
          )}

        </div>

      </div>

      {/* RESULTS */}
      <div
        className="
          flex-1
          min-h-0
          overflow-auto

          rounded-md
          border
          bg-background
        "
      >

        {results.map((place) => (

          <button
            key={`${place.lat}-${place.lon}`}
            type="button"
            onClick={() =>
              onSelect({
                name:
                  place.display_name,
                lat: parseFloat(
                  place.lat
                ),
                lng: parseFloat(
                  place.lon
                ),
                address:
                  place.display_name,
              })
            }
            className="
              w-full
              flex
              items-start
              gap-3

              p-3

              text-left

              hover:bg-muted
              transition-colors
            "
          >

            <MapPin
              className="
                w-4
                h-4
                mt-0.5
                shrink-0
              "
            />

            <div
              className="
                text-sm
                text-muted-foreground
              "
            >
              {place.display_name}
            </div>

          </button>

        ))}

        {!loading &&
          results.length === 0 &&
          query.length >= 3 && (
            <div
              className="
                p-3
                text-xs
                text-muted-foreground
              "
            >
              No results found
            </div>
          )}

      </div>

    </div>
  );
}