"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, MapPin, Search } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [searchMode, setSearchMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [showLocationDrawer, setShowLocationDrawer] = useState(false);
  const [drawerMinimized, setDrawerMinimized] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const reverseDebounceRef = useRef(null);

  const isControlled = typeof openOverride === "boolean";
  const pickerOpen = isControlled ? openOverride : open;

  useEffect(() => {
    if (!pickerOpen) return;

    setSearchMode(false);
    setSearchValue(initialQuery || editor.address || "");
    setShowLocationDrawer(Boolean(editor.address));
    setDrawerMinimized(false);
    setSnapshot({
      address: editor.address ?? null,
      lat: editor.lat ?? null,
      lng: editor.lng ?? null,
    });
  }, [editor.address, editor.lat, editor.lng, initialQuery, pickerOpen]);

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
    editor.setAddress(null);
    setShowLocationDrawer(true);
    setDrawerMinimized(false);

    if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
    reverseDebounceRef.current = setTimeout(() => reverseGeocode(lat, lng), 350);
  }

  function handleSelect(location) {
    const address = location.address || location.name || "";
    editor.setLat(location.lat);
    editor.setLng(location.lng);
    editor.setAddress(address);
    setSearchValue(address);
    setSearchMode(false);
    setShowLocationDrawer(true);
    setDrawerMinimized(false);
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return;

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        editor.setLat(coords.latitude);
        editor.setLng(coords.longitude);
        editor.setAddress(null);
        setSearchMode(false);
        setShowLocationDrawer(true);
        setDrawerMinimized(false);
        await reverseGeocode(coords.latitude, coords.longitude);
        setLoadingGPS(false);
      },
      () => setLoadingGPS(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  function clearLocation() {
    editor.setLat(null);
    editor.setLng(null);
    editor.setAddress(null);
    setSearchValue("");
    setShowLocationDrawer(false);
  }

  function cancelLocationEdit() {
    if (snapshot) {
      editor.setLat(snapshot.lat);
      editor.setLng(snapshot.lng);
      editor.setAddress(snapshot.address);
    }
    setSearchMode(false);
    setPickerOpen(false);
  }

  function finishLocationEdit() {
    setSearchMode(false);
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

      <Dialog
        open={pickerOpen}
        onOpenChange={(value) => (value ? setPickerOpen(true) : cancelLocationEdit())}
      >
        <DialogContent
          className="h-dvh max-w-none overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-5xl sm:rounded-xl [&>button]:right-3 [&>button]:top-3 [&>button]:z-[2000] [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-background [&>button]:opacity-100 [&>button]:shadow-lg"
        >
          <div className="relative h-full w-full overflow-hidden">
            {searchMode ? (
              <LocationSearchInput
                value={searchValue}
                onChange={setSearchValue}
                onSelect={handleSelect}
                onUseCurrentLocation={handleUseCurrentLocation}
                loadingGPS={loadingGPS}
                onBack={() => setSearchMode(false)}
                onCancel={() => setSearchMode(false)}
              />
            ) : (
              <>
                <LocationMapPreview
                  lat={editor.lat ?? userLocation?.lat ?? 19.076}
                  lng={editor.lng ?? userLocation?.lng ?? 72.8777}
                  onChange={handleMapChange}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  loadingGPS={loadingGPS}
                />

                <div className="absolute left-3 right-16 top-3 z-[1000] sm:left-12 sm:right-auto sm:w-[420px]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSearchMode(true)}
                    className="h-12 w-full justify-start gap-3 rounded-full bg-background px-4 text-left shadow-lg hover:bg-background"
                  >
                    <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm text-muted-foreground">
                      {editor.address || "Search here"}
                    </span>
                  </Button>
                </div>

                {showLocationDrawer && (
                  <div className="absolute inset-x-3 bottom-3 z-[1000] sm:left-1/2 sm:right-auto sm:w-[520px] sm:-translate-x-1/2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleUseCurrentLocation}
                      disabled={loadingGPS}
                      aria-label="Use current location"
                      className="absolute bottom-full right-0 mb-3 h-12 w-12 rounded-full border bg-background shadow-xl"
                    >
                      <MapPin className="h-5 w-5" />
                    </Button>

                    <Card className="rounded-2xl border bg-background/95 shadow-2xl backdrop-blur">
                      {drawerMinimized ? (
                        <button
                          type="button"
                          onClick={() => setDrawerMinimized(false)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left"
                          aria-label="Expand selected location"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {editor.address || "Selected location"}
                          </span>
                          <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                        </button>
                      ) : (
                        <CardContent className="p-4">
                          <button
                            type="button"
                            onClick={() => setDrawerMinimized(true)}
                            className="mb-3 flex w-full justify-center py-1"
                            aria-label="Minimize selected location"
                          >
                            <span className="h-1.5 w-10 rounded-full bg-muted" />
                          </button>

                          <div className="min-w-0">
                            <div className="truncate text-base font-medium">
                              {editor.address || "Selected location"}
                            </div>
                            <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {editor.address
                                ? "Location selected from the map"
                                : "Finding the address…"}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              type="button"
                              className="flex-1"
                              onClick={finishLocationEdit}
                            >
                              Use location
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={clearLocation}
                            >
                              Clear
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                )}

                {!showLocationDrawer && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleUseCurrentLocation}
                    disabled={loadingGPS}
                    aria-label="Use current location"
                    className="absolute bottom-6 right-4 z-[1000] h-12 w-12 rounded-full border bg-background shadow-xl"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
