"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Check } from "lucide-react";

export default function SpaceSelectorDrawer({
  spaces = [],
  selectedSpaces = [],
  setSelectedSpaces,
}) {

  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const filteredSpaces =
    useMemo(() => {

      if (!search.trim()) {
        return spaces;
      }

      return spaces.filter((space) =>
        space.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

    }, [spaces, search]);

  function isSelected(spaceId) {
    return selectedSpaces.some(
      (s) => s.id === spaceId
    );
  }

  function toggleSpace(space) {

    if (isSelected(space.id)) {

      setSelectedSpaces(
        selectedSpaces.filter(
          (s) => s.id !== space.id
        )
      );

      return;
    }

    setSelectedSpaces([
      ...selectedSpaces,
      space,
    ]);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >

      <DrawerTrigger asChild>

        <Button
          variant="outline"
          size="sm"
          className="
            justify-start
            gap-2
            min-w-[180px]
            max-w-[260px]
            overflow-hidden
          "
        >

          {selectedSpaces.length === 0
            ? "Select Spaces"
            : selectedSpaces
                .map((s) => s.name)
                .join(", ")}

        </Button>

      </DrawerTrigger>

      <DrawerContent
        className="max-h-[85vh]"
      >

        <DrawerHeader>

          <DrawerTitle>
            Select Spaces
          </DrawerTitle>

        </DrawerHeader>

        <div className="p-4 pt-0 space-y-4 overflow-y-auto">

          {/* SEARCH */}
          <Input
            placeholder="Search spaces..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          {/* GRID */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
            "
          >

            {filteredSpaces.map(
              (space) => {

                const selected =
                  isSelected(
                    space.id
                  );

                return (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() =>
                      toggleSpace(space)
                    }
                    className={`
                      relative
                      border
                      rounded-xl
                      p-3
                      text-left
                      transition-all

                      ${
                        selected
                          ? `
                            border-primary
                            bg-primary/5
                          `
                          : `
                            hover:bg-muted/50
                          `
                      }
                    `}
                  >

                    {/* CHECK */}
                    {selected && (
                      <div
                        className="
                          absolute
                          top-2
                          right-2
                          w-5
                          h-5
                          rounded-full
                          bg-primary
                          text-primary-foreground
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <Check
                          className="w-3 h-3"
                        />

                      </div>
                    )}

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      {space.logo_url ? (
                        <Image
                          src={
                            space.logo_url
                          }
                          alt={space.name}
                          width={40}
                          height={40}
                          className="
                            rounded-lg
                          "
                        />
                      ) : (
                        <div
                          className="
                            w-10
                            h-10
                            rounded-lg
                            bg-muted
                            flex
                            items-center
                            justify-center
                            font-medium
                          "
                        >
                          {space.name?.[0]}
                        </div>
                      )}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            font-medium
                            truncate
                          "
                        >
                          {space.name}
                        </div>

                        <div
                          className="
                            text-xs
                            text-muted-foreground
                            truncate
                          "
                        >
                          @{space.slug}
                        </div>

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>

      </DrawerContent>

    </Drawer>
  );
}