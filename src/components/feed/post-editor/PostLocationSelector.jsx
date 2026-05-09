"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import LocationSearchInput from "@/components/shared/LocationSearchInput";
import LocationMapPreview from "@/components/shared/LocationMapPreview";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MapPin, Link2, LocateFixed } from "lucide-react";

export default function PostLocationSelector({ editor }) {
  const {
    setLat,
    setLng,
    setAddress,
    setMeetingLink,
    setMode,

    lat,
    lng,
    address,
    meeting_link,
    mode: initialMode,
  } = editor;

  const [open, setOpen] = useState(false);

  const [mode, setLocalMode] = useState(initialMode || "offline");
  const [onlineLink, setOnlineLink] = useState(meeting_link || "");

  const [searchValue, setSearchValue] = useState(address || "");
  const [loadingGPS, setLoadingGPS] = useState(false);

  const [tempLat, setTempLat] = useState(lat);
  const [tempLng, setTempLng] = useState(lng);
  const [tempAddress, setTempAddress] = useState(address || "");

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  /* -------------------------
     REVERSE GEOCODE
  ------------------------- */
  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(`/api/osm-reverse?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  }

  /* -------------------------
     SELECT
  ------------------------- */
  function handleSelect(loc) {
    setTempLat(loc.lat);
    setTempLng(loc.lng);
    setTempAddress(loc.name);
    setSearchValue(loc.name);
  }

  /* -------------------------
     MAP CHANGE
  ------------------------- */
  async function handleMapChange(lat, lng) {
    setTempLat(lat);
    setTempLng(lng);

    setSearchValue("Fetching location...");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/osm-reverse?lat=${lat}&lng=${lng}`,
          { signal: controller.signal }
        );

        const data = await res.json();

        if (data?.display_name) {
          setTempAddress(data.display_name);
          setSearchValue(data.display_name);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setSearchValue("Unable to fetch location");
        }
      }
    }, 500);
  }

  /* -------------------------
     GPS
  ------------------------- */
  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) return;

    setLoadingGPS(true);
    setSearchValue("Detecting location...");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const data = await reverseGeocode(latitude, longitude);

      if (data?.display_name) {
        setTempLat(latitude);
        setTempLng(longitude);
        setTempAddress(data.display_name);
        setSearchValue(data.display_name);
      }

      setLoadingGPS(false);
    });
  }

  /* -------------------------
     SAVE
  ------------------------- */
  function handleSave() {
    setMode(mode);

    if (mode === "online") {
      if (!onlineLink) return;

      setMeetingLink(onlineLink);
      setLat(null);
      setLng(null);
      setAddress(null);
    } else {
      if (!tempLat || !tempLng) return;

      setLat(tempLat);
      setLng(tempLng);
      setAddress(tempAddress);
      setMeetingLink(null);
    }

    setOpen(false);
  }

  /* -------------------------
     DISPLAY VALUE
  ------------------------- */
  const displayValue =
    mode === "online"
      ? meeting_link
      : address;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2"
            >
              {mode === "online" ? <Link2 /> : <MapPin />}

              <span className="truncate max-w-[120px]">
                {displayValue || "Location"}
              </span>
            </Button>
          </TooltipTrigger>

          {displayValue && (
            <TooltipContent>
              <p className="max-w-xs text-xs">{displayValue}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-md w-full max-w-5xl h-[520px] flex overflow-hidden">

            {/* LEFT */}
            <div className="w-1/2 p-4 flex flex-col gap-3">

              <div className="flex gap-2">
                <Button
                  variant={mode === "offline" ? "default" : "outline"}
                  onClick={() => setLocalMode("offline")}
                  className="flex-1"
                >
                  <LocateFixed />
                  Offline
                </Button>

                <Button
                  variant={mode === "online" ? "default" : "outline"}
                  onClick={() => setLocalMode("online")}
                  className="flex-1"
                >
                  <Link2 />
                  Online
                </Button>
              </div>

              {mode === "offline" ? (
                <LocationSearchInput
                  onSelect={handleSelect}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  loadingGPS={loadingGPS}
                  value={searchValue}
                  onChange={setSearchValue}
                />
              ) : (
                <input
                  type="url"
                  placeholder="Paste meeting link"
                  value={onlineLink}
                  onChange={(e) => setOnlineLink(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                />
              )}
            </div>

            {/* RIGHT */}
            <div className="w-1/2 flex flex-col">

              {mode === "offline" ? (
                <>
                  <div className="flex-1">
                    <LocationMapPreview
                      lat={tempLat || 19.076}
                      lng={tempLng || 72.8777}
                      onChange={handleMapChange}
                    />
                  </div>

                  <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                    {tempAddress || "Click map or search location"}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Enter meeting link on the left
                </div>
              )}

              <div className="p-3 flex justify-end gap-2 border-t">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button onClick={handleSave}>
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