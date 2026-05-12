"use client";

import {
  useState,
  useRef,
} from "react";

import { Button } from "@/components/ui/button";

import LocationSearchInput from "@/components/shared/LocationSearchInput";

import LocationMapPreview from "@/components/shared/LocationMapPreview";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  MapPin,
  Link2,
  LocateFixed,
} from "lucide-react";

export default function PostLocationSelector({
  editor,
}) {
  const {
    setLat,
    setLng,
    setAddress,
    setMeetingLink,

    lat,
    lng,
    address,
    meeting_link,
  } = editor;

  // =====================================================
  // STATE
  // =====================================================

  const [open, setOpen] =
    useState(false);

  const [loadingGPS, setLoadingGPS] =
    useState(false);

  const [searchValue, setSearchValue] =
    useState(address || "");

  const [onlineLink, setOnlineLink] =
    useState(
      meeting_link || ""
    );

  const [tempLat, setTempLat] =
    useState(lat);

  const [tempLng, setTempLng] =
    useState(lng);

  const [tempAddress, setTempAddress] =
    useState(address || "");

  const debounceRef =
    useRef(null);

  const abortRef =
    useRef(null);

  // =====================================================
  // REVERSE GEOCODE
  // =====================================================

  async function reverseGeocode(
    lat,
    lng
  ) {
    try {
      const res = await fetch(
        `/api/osm-reverse?lat=${lat}&lng=${lng}`
      );

      return await res.json();
    } catch {
      return null;
    }
  }

  // =====================================================
  // SEARCH SELECT
  // =====================================================

  function handleSelect(loc) {
    setTempLat(loc.lat);

    setTempLng(loc.lng);

    setTempAddress(loc.name);

    setSearchValue(loc.name);
  }

  // =====================================================
  // MAP CHANGE
  // =====================================================

  async function handleMapChange(
    lat,
    lng
  ) {
    setTempLat(lat);

    setTempLng(lng);

    setSearchValue(
      "Fetching location..."
    );

    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      );
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller =
      new AbortController();

    abortRef.current =
      controller;

    debounceRef.current =
      setTimeout(
        async () => {
          try {
            const res =
              await fetch(
                `/api/osm-reverse?lat=${lat}&lng=${lng}`,
                {
                  signal:
                    controller.signal,
                }
              );

            const data =
              await res.json();

            if (
              data?.display_name
            ) {
              setTempAddress(
                data.display_name
              );

              setSearchValue(
                data.display_name
              );
            }
          } catch (err) {
            if (
              err.name !==
              "AbortError"
            ) {
              setSearchValue(
                "Unable to fetch location"
              );
            }
          }
        },

        500
      );
  }

  // =====================================================
  // GPS
  // =====================================================

  async function handleUseCurrentLocation() {
    if (
      !navigator.geolocation
    ) {
      return;
    }

    setLoadingGPS(true);

    setSearchValue(
      "Detecting location..."
    );

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const {
          latitude,
          longitude,
        } = pos.coords;

        const data =
          await reverseGeocode(
            latitude,
            longitude
          );

        if (
          data?.display_name
        ) {
          setTempLat(
            latitude
          );

          setTempLng(
            longitude
          );

          setTempAddress(
            data.display_name
          );

          setSearchValue(
            data.display_name
          );
        }

        setLoadingGPS(false);
      }
    );
  }

  // =====================================================
  // SAVE
  // =====================================================

  function handleSave() {
    // ADDRESS

    setLat(tempLat || null);

    setLng(tempLng || null);

    setAddress(
      tempAddress || null
    );

    // MEETING LINK

    setMeetingLink(
      onlineLink || null
    );

    setOpen(false);
  }

  // =====================================================
  // DISPLAY
  // =====================================================

  const hasLocation =
    address ||
    meeting_link;

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <TooltipProvider>

        <Tooltip>

          <TooltipTrigger asChild>

            <Button
              variant="outline"
              onClick={() =>
                setOpen(true)
              }
              className="flex items-center gap-2"
            >

              <MapPin className="h-4 w-4" />

              <span className="truncate max-w-[160px]">

                {hasLocation
                  ? "Location Added"
                  : "Add Location"}

              </span>

            </Button>

          </TooltipTrigger>

          {hasLocation && (
            <TooltipContent>

              <div className="space-y-1 text-xs max-w-xs">

                {address && (
                  <div>
                    📍 {address}
                  </div>
                )}

                {meeting_link && (
                  <div className="break-all">
                    🔗{" "}
                    {
                      meeting_link
                    }
                  </div>
                )}

              </div>

            </TooltipContent>
          )}

        </Tooltip>

      </TooltipProvider>

      {/* MODAL */}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-background rounded-xl w-full max-w-5xl h-[620px] flex overflow-hidden">

            {/* LEFT */}

            <div className="w-1/2 p-4 flex flex-col gap-4 border-r">

              {/* ADDRESS */}

              <div className="space-y-2">

                <div className="flex items-center gap-2 text-sm font-medium">

                  <MapPin className="h-4 w-4" />

                  Physical Address

                </div>

                <LocationSearchInput
                  onSelect={
                    handleSelect
                  }
                  onUseCurrentLocation={
                    handleUseCurrentLocation
                  }
                  loadingGPS={
                    loadingGPS
                  }
                  value={
                    searchValue
                  }
                  onChange={
                    setSearchValue
                  }
                />

              </div>

              {/* MEETING LINK */}

              <div className="space-y-2">

                <div className="flex items-center gap-2 text-sm font-medium">

                  <Link2 className="h-4 w-4" />

                  Online Meeting Link

                </div>

                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={
                    onlineLink
                  }
                  onChange={(e) =>
                    setOnlineLink(
                      e.target.value
                    )
                  }
                  className="
                    border
                    rounded-md
                    px-3
                    py-2
                    text-sm
                    w-full
                    bg-background
                  "
                />

              </div>

            </div>

            {/* RIGHT */}

            <div className="w-1/2 flex flex-col">

              <div className="flex-1">

                <LocationMapPreview
                  lat={
                    tempLat ||
                    19.076
                  }
                  lng={
                    tempLng ||
                    72.8777
                  }
                  onChange={
                    handleMapChange
                  }
                />

              </div>

              <div className="px-3 py-2 text-xs text-muted-foreground border-t">

                {tempAddress ||
                  "Search or click map"}

              </div>

              <div className="p-3 flex justify-end gap-2 border-t">

                <Button
                  variant="ghost"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={
                    handleSave
                  }
                >
                  Save
                </Button>

              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
}