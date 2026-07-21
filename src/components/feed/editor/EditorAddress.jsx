"use client";

import { useMemo, useRef, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

import { MapPin, LocateFixed } from "lucide-react";

import LocationSearchInput from "@/components/shared/LocationSearchInput";

import LocationMapPreview from "@/components/shared/LocationMapPreview";

export default function EditorAddress({ editor }) {
  const [open, setOpen] = useState(false);

  const [loadingGPS, setLoadingGPS] = useState(false);

  const debounceRef = useRef(null);

  const summary = useMemo(() => {
    return editor.address ? [editor.address] : ["Set location"];
  }, [editor.address]);

  // =====================================================
  // REVERSE GEOCODE
  // =====================================================

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(`/api/osm-reverse?lat=${lat}&lng=${lng}`);

      const data = await res.json();

      if (data?.display_name) {
        editor.setAddress(data.display_name);
      }
    } catch {}
  }

  // =====================================================
  // MAP CHANGE
  // =====================================================

  async function handleMapChange(lat, lng) {
    editor.setLat(lat);
    editor.setLng(lng);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 400);
  }

  // =====================================================
  // SEARCH SELECT
  // =====================================================

  function handleSelect(loc) {
    editor.setLat(loc.lat);
    editor.setLng(loc.lng);

    editor.setAddress(loc.address);
  }

  // =====================================================
  // GPS
  // =====================================================

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return;

    setLoadingGPS(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;

        const lng = position.coords.longitude;

        editor.setLat(lat);
        editor.setLng(lng);

        await reverseGeocode(lat, lng);

        setLoadingGPS(false);
      },
      (error) => {
        console.error(error);

        setLoadingGPS(false);
      },
      {
        enableHighAccuracy: true,
      },
    );
  }

  return (
    <>
      {/* TRIGGER */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <MapPin className="h-5 w-5" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom" align="start">
            <div className="space-y-1 text-xs">
              {summary.map((item, i) => (
                <div key={i}>{item}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-dvh w-screen max-w-none overflow-hidden rounded-none p-0">
          <div className="relative h-full w-full overflow-hidden">
            {/* MAP */}

            <LocationMapPreview
              lat={editor.lat || 19.076}
              lng={editor.lng || 72.8777}
              onChange={handleMapChange}
            />

            {/* OVERLAY LAYOUT */}

            <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col justify-between p-2 sm:p-4">
              {/* =====================================================
                  TOP SEARCH
              ===================================================== */}

              <div className="pointer-events-auto w-full pt-14 sm:ml-12 sm:w-[380px] sm:pt-0">
                <div className="rounded-xl border bg-background p-2 shadow-lg">
                  <LocationSearchInput
                    value={editor.address || ""}
                    onChange={editor.setAddress}
                    onSelect={handleSelect}
                    loadingGPS={loadingGPS}
                    onUseCurrentLocation={handleUseCurrentLocation}
                  />
                </div>
              </div>

              {/* =====================================================
                  BOTTOM CARD
              ===================================================== */}

              <div className="pointer-events-auto w-full sm:mx-auto sm:max-w-[520px]">
                <div className="overflow-hidden rounded-2xl border bg-background shadow-xl backdrop-blur">
                  <div className="flex items-start gap-3 p-4">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        Selected Location
                      </div>

                      <div className="line-clamp-2 break-words text-sm text-muted-foreground">
                        {editor.address || "Move map or search"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse justify-between gap-2 border-t p-3 sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={() => {
                        editor.setLat(null);
                        editor.setLng(null);
                        editor.setAddress(null);
                      }}
                    >
                      Clear
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>

                      <Button onClick={() => setOpen(false)}>Done</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
