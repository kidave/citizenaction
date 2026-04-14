"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationSearchInput({
  onSelect,
  onUseCurrentLocation,
  loadingGPS,
  value,
  onChange,
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/osm?q=${query}`);
        const data = await res.json();
        setResults(data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="flex flex-col h-full">

      {/* 🔥 SEARCH BAR */}
      <div className="flex items-center gap-2 mb-2">

        <Button
          variant="outline"
          size="icon"
          onClick={onUseCurrentLocation}
        >
          {loadingGPS ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
        </Button>

        <Input
          placeholder="Search location"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
          }}
        />

      </div>

      {/* 🔽 RESULTS */}
      <div className="flex-1 min-h-0 overflow-auto border rounded-md bg-background">

        {results.map((place) => (
          <div
            key={place.place_id}
            onClick={() =>
              onSelect({
                name: place.display_name,
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
                address: place.address,
                place_id: place.place_id,
              })
            }
            className="flex items-start gap-2 p-2 hover:bg-muted cursor-pointer"
          >
            <MapPin className="w-4 h-4 mt-1" />
            <div className="text-sm">
              {place.display_name}
            </div>
          </div>
        ))}

        {results.length === 0 && query.length >= 3 && (
          <div className="p-2 text-xs text-muted-foreground">
            No results found
          </div>
        )}

      </div>
    </div>
  );
}