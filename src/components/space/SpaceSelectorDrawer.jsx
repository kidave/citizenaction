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
  const [open, setOpen] = useState(false);

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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[180px] max-w-[260px] justify-start gap-2 overflow-hidden"
        >
          {selectedSpaces.length === 0
            ? "Select Spaces"
            : selectedSpaces.map((s) => s.name).join(", ")}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Select Spaces</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto p-4 pt-0">
          {/* SEARCH */}
          <Input
            placeholder="Search spaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* GRID */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredSpaces.map((space) => {
              const selected = isSelected(space.id);

              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => toggleSpace(space)}
                  className={`relative rounded-xl border p-3 text-left transition-all ${
                    selected
                      ? `border-primary bg-primary/5`
                      : `hover:bg-muted/50`
                  } `}
                >
                  {/* CHECK */}
                  {selected && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {space.logo_url ? (
                      <Image
                        src={space.logo_url}
                        alt={space.name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-medium">
                        {space.name?.[0]}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{space.name}</div>

                      <div className="truncate text-xs text-muted-foreground">
                        @{space.slug}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
