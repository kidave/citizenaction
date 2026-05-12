"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Check, Search } from "lucide-react";

export default function SpaceExplorer({
  open,
  onOpenChange,
  spaces = [],
  selectedSpaces = [],
  setSelectedSpaces,
}) {

  const [search, setSearch] =
    useState("");

  const filteredSpaces =
    useMemo(() => {

      if (!search.trim()) {
        return spaces;
      }

      return spaces.filter(
        (space) =>
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
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent
        className="
          p-0
          gap-0

          w-full
          h-full
          max-w-none
          rounded-none

          sm:max-w-5xl
          sm:h-[85vh]
          sm:rounded-2xl

          overflow-hidden
          flex
          flex-col
        "
      >

        {/* TOP BAR */}
        <div
        className="
            border-b
            p-4
            flex
            items-center
            justify-between
            gap-4
        "
        >

        {/* LEFT */}
        <div
            className="
            flex
            items-center
            gap-3
            min-w-0
            "
        >

            {/* GLOBAL */}
            <button
            type="button"
            onClick={() =>
                setSelectedSpaces([])
            }
            className="
                flex
                items-center
                gap-3
                px-4
                py-2
                rounded-full
                border
                transition-all
                shrink-0

                hover:bg-muted/40
            "
            >

            <div className="text-sm font-medium">
                Global
            </div>

            <div
                className={`
                w-5
                h-5
                rounded-full
                border
                flex
                items-center
                justify-center
                transition-all

                ${
                    selectedSpaces.length === 0
                    ? `
                        bg-primary
                        border-primary
                        text-primary-foreground
                    `
                    : `
                        border-muted-foreground
                    `
                }
                `}
            >

                {selectedSpaces.length === 0 && (
                <Check
                    className="
                    w-3
                    h-3
                    "
                />
                )}

            </div>

            </button>

            {/* SELECTED SPACES */}
            {selectedSpaces.length > 0 && (
            <div
                className="
                flex
                items-center
                -space-x-2
                min-w-0
                "
            >

                {selectedSpaces
                .slice(0, 5)
                .map((space) => (

                    <div
                    key={space.id}
                    className="
                        relative
                        w-9
                        h-9
                        rounded-full
                        overflow-hidden
                        border-2
                        border-background
                        bg-muted
                        shrink-0
                    "
                    >

                    {space.logo_url ? (
                        <Image
                        src={space.logo_url}
                        alt={space.name}
                        fill
                        className="
                            object-cover
                        "
                        />
                    ) : (
                        <div
                        className="
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                            text-xs
                            font-medium
                        "
                        >
                        {space.name?.[0]}
                        </div>
                    )}

                    </div>
                ))}

                {selectedSpaces.length > 5 && (
                <div
                    className="
                    w-9
                    h-9
                    rounded-full
                    border-2
                    border-background
                    bg-muted
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-medium
                    shrink-0
                    "
                >
                    +{selectedSpaces.length - 5}
                </div>
                )}

            </div>
            )}

        </div>

        {/* RIGHT */}
        <div
            className="
            flex
            items-center
            gap-2
            shrink-0
            "
        >

            <Button
            variant="outline"
            size="sm"
            onClick={() =>
                onOpenChange(false)
            }
            >
            Cancel
            </Button>

            <Button
            size="sm"
            onClick={() =>
                onOpenChange(false)
            }
            >
            Done
            </Button>

        </div>

        </div>

        {/* SEARCH */}
        <div className="p-4 border-b">

          <div className="relative">

            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                w-4
                h-4
                text-muted-foreground
              "
            />

            <Input
              placeholder="Search spaces..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="pl-9"
            />

          </div>

        </div>

        {/* CONTENT */}
        <div
          className="
            flex-1
            overflow-y-auto
            p-4
          "
        >

          {/* SPACE GRID */}
          <div
            className="
              grid
              grid-cols-4
              sm:grid-cols-5
              md:grid-cols-6
              lg:grid-cols-7
              gap-4
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
                    className="
                      flex
                      flex-col
                      items-center
                      gap-2
                      group
                    "
                  >

                    {/* TILE */}
                    <div
                      className={`
                        relative
                        w-16
                        h-16
                        rounded-2xl
                        overflow-hidden
                        border
                        transition-all

                        ${
                          selected
                            ? `
                              border-primary
                              ring-2
                              ring-primary/20
                            `
                            : `
                              border-border
                              group-hover:border-primary/40
                            `
                        }
                      `}
                    >

                      {space.logo_url ? (
                        <Image
                          src={
                            space.logo_url
                          }
                          alt={
                            space.name
                          }
                          fill
                          className="
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            w-full
                            h-full
                            bg-muted
                            flex
                            items-center
                            justify-center
                            text-lg
                            font-semibold
                          "
                        >
                          {
                            space.name?.[0]
                          }
                        </div>
                      )}

                      {/* CHECK */}
                      {selected && (
                        <div
                          className="
                            absolute
                            top-1
                            right-1
                            w-5
                            h-5
                            rounded-full
                            bg-primary
                            text-primary-foreground
                            flex
                            items-center
                            justify-center
                            shadow-sm
                          "
                        >

                          <Check
                            className="
                              w-3
                              h-3
                            "
                          />

                        </div>
                      )}

                    </div>

                    {/* LABEL */}
                    <div
                      className="
                        text-xs
                        text-center
                        line-clamp-2
                        leading-tight
                        max-w-[72px]
                      "
                    >
                      {space.name}
                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>

      </DialogContent>

    </Dialog>
  );
}