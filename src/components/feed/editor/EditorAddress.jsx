"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Check, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LocationSearchInput from "@/components/shared/LocationSearchInput";

export default function EditorAddress({ editor }) {
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const debounceRef = useRef(null);
  const lastQueryRef = useRef("");

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    const address = editor.address?.trim();
    if (!address || editor.lat || editor.lng) {
      setSuggestion(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (address === lastQueryRef.current) return;
      lastQueryRef.current = address;

      setLoading(true);
      try {
        const params = new URLSearchParams({ q: address });
        if (userLocation) {
          params.set("lat", String(userLocation.lat));
          params.set("lng", String(userLocation.lng));
        }

        const response = await fetch(`/api/osm?${params.toString()}`);
        if (!response.ok) return;

        const data = await response.json();
        const results = Array.isArray(data) ? data : data?.results || [];
        const first = results[0];
        if (!first) return;

        const lat = Number(first.lat);
        const lng = Number(first.lon ?? first.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        setSuggestion({
          lat,
          lng,
          address: first.display_name || first.address || address,
          name: first.name || first.display_name?.split(",")[0] || address,
        });
      } catch (error) {
        console.warn("Location suggestion failed", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [editor.address, editor.lat, editor.lng, userLocation]);

  function applySuggestion() {
    if (!suggestion) return;

    editor.setLat(suggestion.lat);
    editor.setLng(suggestion.lng);
    editor.setAddress(suggestion.address);
    setSuggestion(null);
  }

  function clearLocation() {
    editor.setLat(null);
    editor.setLng(null);
    editor.setAddress(null);
    setSuggestion(null);
    lastQueryRef.current = "";
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={editor.address ? "secondary" : "ghost"}
              size="icon"
              className="shrink-0"
              onClick={() => setOpen(true)}
              aria-label={editor.address ? "Change location" : "Add location"}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {editor.address || "Add location"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {suggestion && !editor.lat && !editor.lng && (
        <div className="absolute bottom-14 left-2 right-2 z-20 sm:left-auto sm:right-4 sm:w-[420px]">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-md">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{suggestion.name}</p>
              <p className="truncate text-xs text-muted-foreground">{suggestion.address}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={applySuggestion}
              className="shrink-0"
            >
              <Check className="mr-1 h-4 w-4" />
              Use
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setOpen(true)}
              aria-label="Change location"
              className="shrink-0"
            >
              <Pencil />
            </Button>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-20 z-[70] rounded-xl border bg-background p-3 shadow-xl sm:left-auto sm:right-6 sm:w-[420px]">
          <LocationSearchInput
            value={editor.address || ""}
            onChange={(value) => {
              editor.setAddress(value);
              editor.setLat(null);
              editor.setLng(null);
            }}
            onSelect={(location) => {
              editor.setLat(location.lat);
              editor.setLng(location.lng);
              editor.setAddress(location.address);
              setSuggestion(null);
              setOpen(false);
            }}
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
