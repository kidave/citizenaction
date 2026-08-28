"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LocationSearchInput from "@/components/shared/LocationSearchInput";

const LocationMapPreview = dynamic(
  () => import("@/components/shared/LocationMapPreview"),
  { ssr: false },
);

export default function EditorAddress({
  editor,
  openOverride,
  onOpenChange,
  initialQuery = "",
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const reverseDebounceRef = useRef(null);

  const isControlled = typeof openOverride === "boolean";
  const pickerOpen = isControlled ? openOverride : open;

  useEffect(() => {
    if (pickerOpen) {
      setSearchValue(initialQuery || editor.address || "");
      setSnapshot({
        address: editor.address ?? null,
        lat: editor.lat ?? null,
        lng: editor.lng ?? null,
      });
    }
  }, [editor.address, initialQuery, pickerOpen]);

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

  function setPickerOpen(value) {
    if (isControlled) onOpenChange?.(value);
    else setOpen(value);
  }

  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`/api/osm-reverse?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      if (data?.display_name) editor.setAddress(data.display_name);
    } catch {}
  }

  function handleMapChange(lat, lng) {
    editor.setLat(lat);
    editor.setLng(lng);

    if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
    reverseDebounceRef.current = setTimeout(() => reverseGeocode(lat, lng), 350);
  }

  function handleSelect(location) {
    editor.setLat(location.lat);
    editor.setLng(location.lng);
    editor.setAddress(location.address || location.name || "");
    setSearchValue(location.address || location.name || "");
  }

  function handleUseCurrentLocation() {
    navigator.geolocation?.getCurrentPosition(
      async ({ coords }) => {
        editor.setLat(coords.latitude);
        editor.setLng(coords.longitude);
        await reverseGeocode(coords.latitude, coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  function clearLocation() {
    editor.setLat(null);
    editor.setLng(null);
    editor.setAddress(null);
    setSearchValue("");
  }

  function cancelLocationEdit() {
    if (snapshot) {
      editor.setLat(snapshot.lat);
      editor.setLng(snapshot.lng);
      editor.setAddress(snapshot.address);
    }
    setPickerOpen(false);
  }

  function finishLocationEdit() {
    setPickerOpen(false);
  }

  return (
    <>
      {!isControlled && (
        <Button
          type="button"
          variant={editor.address ? "secondary" : "ghost"}
          size="icon"
          className="shrink-0"
          onClick={() => setPickerOpen(true)}
          aria-label={editor.address ? "Change location" : "Add location"}
        >
          <MapPin className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={pickerOpen} onOpenChange={(value) => (value ? setPickerOpen(true) : cancelLocationEdit())}>
        <DialogContent className="h-dvh max-w-none overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-5xl sm:rounded-xl">
          <div className="relative h-full w-full overflow-hidden">
            <LocationMapPreview
              lat={editor.lat ?? userLocation?.lat ?? 19.076}
              lng={editor.lng ?? userLocation?.lng ?? 72.8777}
              onChange={handleMapChange}
            />

            <div className="absolute left-3 right-3 top-3 z-[1000] sm:left-12 sm:right-auto sm:w-[380px]">
              <div className="rounded-xl border bg-background p-2 shadow-lg">
                <LocationSearchInput
                  value={searchValue || editor.address || ""}
                  onChange={(value) => {
                    setSearchValue(value);
                    editor.setAddress(value);
                    editor.setLat(null);
                    editor.setLng(null);
                  }}
                  onSelect={handleSelect}
                  onUseCurrentLocation={handleUseCurrentLocation}
                />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 z-[1000] sm:left-1/2 sm:right-auto sm:w-[520px] sm:-translate-x-1/2">
              <div className="overflow-hidden rounded-2xl border bg-background shadow-xl">
                <div className="flex items-start gap-3 p-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Selected location</div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      {editor.address || "Move the map or search"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t p-3">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={clearLocation}>
                      Clear
                    </Button>
                    <Button type="button" variant="ghost" onClick={cancelLocationEdit}>
                      Cancel
                    </Button>
                  </div>
                  <Button type="button" onClick={finishLocationEdit}>Done</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
