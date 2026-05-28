"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [search, setSearch] = useState("");

  const filteredSpaces = useMemo(() => {
    if (!search.trim()) {
      return spaces;
    }

    return spaces.filter((space) =>
      space.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [spaces, search]);

  function isSelected(spaceId) {
    return selectedSpaces.some((s) => s.id === spaceId);
  }

  function toggleSpace(space) {
    if (isSelected(space.id)) {
      setSelectedSpaces(selectedSpaces.filter((s) => s.id !== space.id));

      return;
    }

    setSelectedSpaces([...selectedSpaces, space]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[85vh] sm:max-w-5xl sm:rounded-2xl">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-4 border-b p-4">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            {/* GLOBAL */}
            <button
              type="button"
              onClick={() => setSelectedSpaces([])}
              className="flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 transition-all hover:bg-muted/40"
            >
              <div className="text-sm font-medium">Global</div>

              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                  selectedSpaces.length === 0
                    ? `border-primary bg-primary text-primary-foreground`
                    : `border-muted-foreground`
                } `}
              >
                {selectedSpaces.length === 0 && <Check className="h-3 w-3" />}
              </div>
            </button>

            {/* SELECTED SPACES */}
            {selectedSpaces.length > 0 && (
              <div className="flex min-w-0 items-center -space-x-2">
                {selectedSpaces.slice(0, 5).map((space) => (
                  <div
                    key={space.id}
                    className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted"
                  >
                    {space.logo_url ? (
                      <Image
                        src={space.logo_url}
                        alt={space.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-medium">
                        {space.name?.[0]}
                      </div>
                    )}
                  </div>
                ))}

                {selectedSpaces.length > 5 && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                    +{selectedSpaces.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search spaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* SPACE GRID */}
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
            {filteredSpaces.map((space) => {
              const selected = isSelected(space.id);

              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => toggleSpace(space)}
                  className="group flex flex-col items-center gap-2"
                >
                  {/* TILE */}
                  <div
                    className={`relative h-16 w-16 overflow-hidden rounded-2xl border transition-all ${
                      selected
                        ? `border-primary ring-2 ring-primary/20`
                        : `border-border group-hover:border-primary/40`
                    } `}
                  >
                    {space.logo_url ? (
                      <Image
                        src={space.logo_url}
                        alt={space.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-semibold">
                        {space.name?.[0]}
                      </div>
                    )}

                    {/* CHECK */}
                    {selected && (
                      <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* LABEL */}
                  <div className="line-clamp-2 max-w-[72px] text-center text-xs leading-tight">
                    {space.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
