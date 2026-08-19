"use client";

import { useMemo, useState } from "react";

import { Check, Search } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SpaceCard from "@/components/space/SpaceCard";

export default function SpaceExplorer({
  open,
  onOpenChange,
  spaces = [],
  selectedSpaces = [],
  setSelectedSpaces,
}) {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  /* ======================================
     CATEGORIES
  ====================================== */

  const categories = useMemo(() => {
    const map = new Map();

    spaces.forEach((space) => {
      if (!space.category_id || !space.category_slug) {
        return;
      }

      if (!map.has(space.category_id)) {
        map.set(space.category_id, {
          id: space.category_id,
          slug: space.category_slug,
          name: space.category_name,
        });
      }
    });

    return Array.from(map.values());
  }, [spaces]);

  /* ======================================
     FILTER SPACES
  ====================================== */

  const filteredSpaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return spaces.filter((space) => {
      /* SEARCH */

      const matchesSearch =
        !query ||
        space.name?.toLowerCase().includes(query) ||
        space.description?.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      /* CATEGORY */

      const matchesCategory =
        !categorySlug || space.category_slug === categorySlug;

      return matchesCategory;
    });
  }, [spaces, search, categorySlug]);

  /* ======================================
     SELECTION
  ====================================== */

  const isSelected = (spaceId) => {
    return selectedSpaces.some((space) => space.id === spaceId);
  };

  const toggleSpace = (space) => {
    if (isSelected(space.id)) {
      setSelectedSpaces(
        selectedSpaces.filter((selected) => selected.id !== space.id),
      );

      return;
    }

    setSelectedSpaces([...selectedSpaces, space]);
  };

  /* ======================================
     GLOBAL
  ====================================== */

  const handleGlobal = () => {
    setSelectedSpaces([]);
  };

  /* ======================================
     CLOSE
  ====================================== */

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[85vh] sm:max-w-5xl sm:rounded-2xl">
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="flex items-center justify-between gap-3 border-b p-4">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            {/* GLOBAL */}

            <Button
              type="button"
              variant={selectedSpaces.length === 0 ? "default" : "outline"}
              onClick={handleGlobal}
              className="shrink-0 gap-2 rounded-full"
            >
              <span>Global</span>

              {selectedSpaces.length === 0 && <Check className="h-4 w-4" />}
            </Button>

            {/* SELECTED SPACES */}

            {selectedSpaces.length > 0 && (
              <div className="flex min-w-0 items-center -space-x-2">
                {selectedSpaces.slice(0, 5).map((space) => (
                  <div
                    key={space.id}
                    className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted"
                  >
                    {space.logo_url ? (
                      <img
                        src={space.logo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-medium">
                        {space.name?.charAt(0)?.toUpperCase() || "S"}
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
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button type="button" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>

        {/* ======================================
            FILTERS
        ====================================== */}

        <div className="border-b p-4">
          <div className="flex w-full items-center gap-2">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search spaces..."
                aria-label="Search spaces"
                className="h-10 rounded-xl pl-9"
              />
            </div>

            {/* CATEGORY */}

            <Select
              value={categorySlug || "all"}
              onValueChange={(value) =>
                setCategorySlug(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="h-10 w-[150px] shrink-0 rounded-xl sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>

                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ======================================
            CONTENT
        ====================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {filteredSpaces.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center text-center">
              <div>
                <p className="font-medium">No Spaces found</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try another search or category.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  selectable
                  selected={isSelected(space.id)}
                  onSelect={toggleSpace}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
