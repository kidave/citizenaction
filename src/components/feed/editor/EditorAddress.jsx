"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Search, MapPin } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

import LocationSearchInput from "@/components/shared/LocationSearchInput";

const LocationMapPreview = dynamic(
  () => import("@/components/shared/LocationMapPreview"),
  { ssr: false },
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const update = () => {
      setIsMobile(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

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
  const [drawerSnap, setDrawerSnap] = useState(null);

  const [snapshot, setSnapshot] = useState(null);

  const reverseDebounceRef = useRef(null);

  const isMobile = useIsMobile();

  const isControlled = typeof openOverride === "boolean";
  const pickerOpen = isControlled ? openOverride : open;

  useEffect(() => {
    if (!pickerOpen) return;

    setSearchMode(false);
    setSearchValue(initialQuery || editor.address || "");

    setShowLocationDrawer(Boolean(editor.address));
    setDrawerSnap(null);

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
        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      () => {},
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      },
    );
  }, []);

  function setPickerOpen(value) {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setOpen(value);
    }
  }

  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`/api/osm-reverse?lat=${lat}&lng=${lng}`);

      const data = await response.json();

      if (data?.display_name) {
        editor.setAddress(data.display_name);
      }
    } catch {
      // Ignore reverse geocoding errors.
    }
  }

  function handleMapChange(lat, lng) {
    editor.setLat(lat);
    editor.setLng(lng);
    editor.setAddress(null);

    setShowLocationDrawer(true);
    setDrawerSnap(null);

    if (reverseDebounceRef.current) {
      clearTimeout(reverseDebounceRef.current);
    }

    reverseDebounceRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 350);
  }

  function handleSelect(location) {
    const address = location.address || location.name || "";

    editor.setLat(location.lat);
    editor.setLng(location.lng);
    editor.setAddress(address);

    setSearchValue(address);
    setSearchMode(false);

    setShowLocationDrawer(true);
    setDrawerSnap(null);
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return;

    setLoadingGPS(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;

        setUserLocation({ lat, lng });

        editor.setLat(lat);
        editor.setLng(lng);
        editor.setAddress(null);

        setSearchMode(false);
        setShowLocationDrawer(true);
        setDrawerSnap(null);

        await reverseGeocode(lat, lng);

        setLoadingGPS(false);
      },
      () => {
        setLoadingGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  function clearLocation() {
    editor.setLat(null);
    editor.setLng(null);
    editor.setAddress(null);

    setSearchValue("");
    setShowLocationDrawer(false);
    setDrawerSnap(null);
  }

  function cancelLocationEdit() {
    if (snapshot) {
      editor.setLat(snapshot.lat);
      editor.setLng(snapshot.lng);
      editor.setAddress(snapshot.address);
    }

    setSearchMode(false);
    setShowLocationDrawer(false);

    setPickerOpen(false);
  }

  function finishLocationEdit() {
    setSearchMode(false);
    setShowLocationDrawer(false);
    setDrawerSnap(null);

    setPickerOpen(false);
  }

  const selectedLocationContent = (
    <>
      <div className="min-w-0">
        <div className="truncate text-base font-medium">
          {editor.address || "Selected location"}
        </div>

        {!editor.address && (
          <div className="mt-1 text-sm text-muted-foreground">
            Finding the address…
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="button" className="flex-1" onClick={finishLocationEdit}>
          Use location
        </Button>

        <Button type="button" variant="outline" onClick={clearLocation}>
          Clear
        </Button>
      </div>
    </>
  );

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
        onOpenChange={(value) => {
          if (value) {
            setPickerOpen(true);
          } else {
            cancelLocationEdit();
          }
        }}
      >
        <DialogContent
          className={`h-dvh max-w-none overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-5xl sm:rounded-xl ${
            searchMode
              ? "[&>button]:hidden"
              : "[&>button]:right-3 [&>button]:top-3 [&>button]:z-[2000] [&>button]:flex [&>button]:h-10 [&>button]:w-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-background [&>button]:p-0 [&>button]:opacity-100 [&>button]:shadow-lg"
          } `}
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
                <div className="h-full w-full">
                  <LocationMapPreview
                    lat={editor.lat ?? userLocation?.lat ?? 19.076}
                    lng={editor.lng ?? userLocation?.lng ?? 72.8777}
                    onChange={handleMapChange}
                    onUseCurrentLocation={handleUseCurrentLocation}
                    loadingGPS={loadingGPS}
                  />
                </div>

                {/* Search */}
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
                  <>
                    {/* MOBILE ONLY */}
                    {isMobile && (
                      <Drawer
                        open={showLocationDrawer}
                        onOpenChange={(drawerOpen) => {
                          setShowLocationDrawer(drawerOpen);

                          if (!drawerOpen) {
                            setDrawerSnap(null);
                          }
                        }}
                        snapPoints={["110px", 0.45]}
                        activeSnapPoint={drawerSnap}
                        setActiveSnapPoint={setDrawerSnap}
                        shouldScaleBackground={false}
                      >
                        <DrawerContent className="z-[1100] max-h-[45vh] border-t bg-background px-4 pb-6">
                          <DrawerHeader className="sr-only">
                            <DrawerTitle>Selected location</DrawerTitle>

                            <DrawerDescription>
                              Review the location before adding it to the post.
                            </DrawerDescription>
                          </DrawerHeader>

                          <div className="mx-auto mb-4 mt-1 h-1.5 w-10 rounded-full bg-muted" />

                          {selectedLocationContent}
                        </DrawerContent>
                      </Drawer>
                    )}

                    {/* DESKTOP ONLY */}
                    {!isMobile && (
                      <div className="absolute bottom-4 left-1/2 z-[1000] w-[520px] -translate-x-1/2">
                        <Card className="rounded-2xl border bg-background/95 shadow-2xl backdrop-blur">
                          <CardContent className="p-4">
                            {selectedLocationContent}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
