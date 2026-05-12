"use client";

import {
  useState,
  useRef,
} from "react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import {
  Button,
} from "@/components/ui/button";

import {
  MapPin,
  LocateFixed,
} from "lucide-react";

import LocationSearchInput
from "@/components/shared/LocationSearchInput";

import LocationMapPreview
from "@/components/shared/LocationMapPreview";

export default function LocationPickerModal({
  editor,
  children,
}) {

  const [open, setOpen] =
    useState(false);

  const [tempLat, setTempLat] =
    useState(
      editor.lat || 19.076
    );

  const [tempLng, setTempLng] =
    useState(
      editor.lng || 72.8777
    );

  const [tempAddress, setTempAddress] =
    useState(
      editor.address || ""
    );

  const [searchValue, setSearchValue] =
    useState(
      editor.address || ""
    );

  const debounceRef =
    useRef(null);

  // =====================================================
  // MAP CHANGE
  // =====================================================

  async function handleMapChange(
    lat,
    lng
  ) {

    setTempLat(lat);

    setTempLng(lng);

    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      );
    }

    debounceRef.current =
      setTimeout(
        async () => {

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

              setTempAddress(
                data.display_name
              );

              setSearchValue(
                data.display_name
              );
            }

          } catch {}

        },
        400
      );
  }

  // =====================================================
  // SELECT SEARCH
  // =====================================================

  function handleSelect(
    loc
  ) {

    setTempLat(loc.lat);

    setTempLng(loc.lng);

    setTempAddress(
      loc.name
    );

    setSearchValue(
      loc.name
    );
  }

  // =====================================================
  // SAVE
  // =====================================================

  function handleSave() {

    editor.setLat(
      tempLat
    );

    editor.setLng(
      tempLng
    );

    editor.setAddress(
      tempAddress
    );

    setOpen(false);
  }

  return (
    <>
      {/* TRIGGER */}
      <div
        onClick={() =>
          setOpen(true)
        }
      >
        {children}
      </div>

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

          <div
            className="
              relative
              w-full
              h-full
            "
          >

            {/* MAP */}
            <LocationMapPreview
              lat={tempLat}
              lng={tempLng}
              onChange={
                handleMapChange
              }
            />

            {/* TOP SEARCH */}
            <div
              className="
                absolute
                top-2
                left-12
                z-[1000]

                w-[380px]
                max-w-[calc(100vw-2rem)]
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
                  onSelect={
                    handleSelect
                  }
                  value={
                    searchValue
                  }
                  onChange={
                    setSearchValue
                  }
                />

              </div>

            </div>

            {/* BOTTOM CARD */}
            <div
              className="
                absolute
                bottom-4
                left-1/2
                -translate-x-1/2

                z-[1000]

                w-[520px]
                max-w-[calc(100vw-2rem)]
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

                {/* ADDRESS */}
                <div
                  className="
                    p-4
                    border-b
                    flex
                    items-start
                    gap-3
                  "
                >

                  <div
                    className="
                      mt-0.5
                    "
                  >

                    <MapPin
                      className="
                        w-4
                        h-4
                      "
                    />

                  </div>

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >

                    <div
                      className="
                        text-sm
                        font-medium
                      "
                    >
                      Selected Location
                    </div>

                    <div
                      className="
                        text-sm
                        text-muted-foreground
                        break-words
                      "
                    >
                      {tempAddress ||
                        "Move map or search"}
                    </div>

                  </div>

                </div>

                {/* ACTIONS */}
                <div
                  className="
                    p-3
                    flex
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
                    onClick={
                      handleSave
                    }
                  >
                    Save Location
                  </Button>

                </div>

              </div>

            </div>

            {/* GPS BUTTON */}
            <Button
              size="icon"
              className="
                absolute
                bottom-6
                right-6
                z-[1000]

                rounded-full
                shadow-lg
              "
            >

              <LocateFixed
                className="
                  w-5
                  h-5
                "
              />

            </Button>

          </div>

        </DialogContent>

      </Dialog>
    </>
  );
}