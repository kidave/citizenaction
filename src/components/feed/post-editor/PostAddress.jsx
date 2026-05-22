"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

import {
  MapPin,
  LocateFixed,
} from "lucide-react";

import LocationSearchInput
from "@/components/shared/LocationSearchInput";

import LocationMapPreview
from "@/components/shared/LocationMapPreview";

export default function PostAddress({
  editor,
}) {
  const [open, setOpen] =
    useState(false);

  const [loadingGPS, setLoadingGPS] =
    useState(false);

  const debounceRef =
    useRef(null);

  const summary =
    useMemo(() => {
      return editor.address
        ? [editor.address]
        : ["Set location"];
    }, [editor.address]);

  // =====================================================
  // REVERSE GEOCODE
  // =====================================================

  async function reverseGeocode(
    lat,
    lng
  ) {
    try {

      const res =
        await fetch(
          `/api/osm-reverse?lat=${lat}&lng=${lng}`
        );

      const data =
        await res.json();

      if (
        data?.display_name
      ) {
        editor.setAddress(
          data.display_name
        );
      }

    } catch {}
  }

  // =====================================================
  // MAP CHANGE
  // =====================================================

  async function handleMapChange(
    lat,
    lng
  ) {
    editor.setLat(lat);
    editor.setLng(lng);

    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      );
    }

    debounceRef.current =
      setTimeout(() => {
        reverseGeocode(
          lat,
          lng
        );
      }, 400);
  }

  // =====================================================
  // SEARCH SELECT
  // =====================================================

  function handleSelect(
    loc
  ) {
    editor.setLat(loc.lat);
    editor.setLng(loc.lng);

    editor.setAddress(
      loc.address
    );
  }

  // =====================================================
  // GPS
  // =====================================================

  function handleUseCurrentLocation() {

    if (
      !navigator.geolocation
    ) return;

    setLoadingGPS(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        editor.setLat(lat);
        editor.setLng(lng);

        await reverseGeocode(
          lat,
          lng
        );

        setLoadingGPS(false);

      },
      (error) => {

        console.error(error);

        setLoadingGPS(false);

      },
      {
        enableHighAccuracy: true,
      }
    );
  }

  return (
    <>
      {/* TRIGGER */}
      <TooltipProvider>
        <Tooltip>

          <TooltipTrigger asChild>

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setOpen(true)
              }
            >
              <MapPin className="h-5 w-5" />
            </Button>

          </TooltipTrigger>

          <TooltipContent
            side="bottom"
            align="start"
          >
            <div className="space-y-1 text-xs">

              {summary.map(
                (item, i) => (
                  <div key={i}>
                    {item}
                  </div>
                )
              )}

            </div>
          </TooltipContent>

        </Tooltip>
      </TooltipProvider>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent
          className="
            p-0
            w-screen
            h-screen
            max-w-none
            rounded-none
            overflow-hidden
          "
        >

          <div className="relative w-full h-full overflow-hidden">

            {/* MAP */}
            <LocationMapPreview
              lat={
                editor.lat ||
                19.076
              }
              lng={
                editor.lng ||
                72.8777
              }
              onChange={
                handleMapChange
              }
            />

            {/* SEARCH */}
            <div
              className="
                absolute
                top-2
                left-2
                right-2
                sm:left-12
                sm:right-auto

                z-[1000]

                sm:w-[380px]
              "
            >

              <div
                className="
                  rounded-xl
                  border
                  bg-background
                  shadow-lg
                  p-2
                "
              >

                <LocationSearchInput
                  value={
                    editor.address ||
                    ""
                  }
                  onChange={
                    editor.setAddress
                  }
                  onSelect={
                    handleSelect
                  }
                  loadingGPS={
                    loadingGPS
                  }
                  onUseCurrentLocation={
                    handleUseCurrentLocation
                  }
                />

              </div>

            </div>

            {/* BOTTOM CARD */}
            <div
              className="
                absolute
                bottom-4
                left-2
                right-2
                sm:left-1/2
                sm:right-auto
                sm:-translate-x-1/2

                z-[1000]

                sm:w-[520px]
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  bg-background
                  shadow-xl
                  overflow-hidden
                "
              >

                <div
                  className="
                    p-4
                    flex
                    items-start
                    gap-3
                  "
                >

                  <MapPin
                    className="
                      w-4
                      h-4
                      mt-0.5
                    "
                  />

                  <div className="min-w-0">

                    <div className="text-sm font-medium">
                      Selected Location
                    </div>

                    <div
                      className="
                        text-sm
                        text-muted-foreground
                        break-words
                      "
                    >
                      {editor.address ||
                        "Move map or search"}
                    </div>

                  </div>

                </div>

                <div
                  className="
                    border-t
                    p-3
                    flex
                    flex-col-reverse
                    sm:flex-row
                    justify-end
                    gap-2
                  "
                >
                  <Button
                    variant="outline"
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    Done
                  </Button>

                </div>

              </div>

            </div>

          </div>

        </DialogContent>

      </Dialog>
    </>
  );
}