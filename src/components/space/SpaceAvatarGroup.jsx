"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function SpaceAvatarGroup({ spaces = [] }) {
  const [open, setOpen] = useState(false);

  if (!Array.isArray(spaces) || spaces.length === 0) {
    return null;
  }

  const uniqueSpaces = Array.from(
    new Map(spaces.map((space) => [space.id, space])).values(),
  );

  const maxVisible = 3;

  const visibleSpaces = uniqueSpaces.slice(0, maxVisible);
  const hiddenCount = Math.max(uniqueSpaces.length - maxVisible, 0);

  function stopPropagation(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <>
      {/* =========================================
          AVATAR GROUP
      ========================================== */}

      <div
        className="flex items-center"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <AvatarGroup>
          {visibleSpaces.map((space) => (
            <Avatar
              key={space.id}
              className="h-7 w-7 cursor-pointer transition-all hover:z-20 hover:scale-110"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
            >
              {space.logo_url ? (
                <AvatarImage src={space.logo_url} alt={space.name || "Space"} />
              ) : null}

              <AvatarFallback>
                {space.name?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
          ))}

          {hiddenCount > 0 && (
            <Avatar
              className="h-7 w-7 cursor-pointer bg-muted text-xs"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
            >
              <AvatarFallback>+{hiddenCount}</AvatarFallback>
            </Avatar>
          )}
        </AvatarGroup>
      </div>

      {/* =========================================
          SPACE SHEET
      ========================================== */}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-hidden sm:max-w-md"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <SheetHeader>
            <SheetTitle>Spaces</SheetTitle>

            <SheetDescription>
              {uniqueSpaces.length}{" "}
              {uniqueSpaces.length === 1 ? "Space" : "Spaces"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 overflow-y-auto">
            <div className="space-y-2">
              {uniqueSpaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/space/${space.slug}`}
                  onClick={(event) => {
                    stopPropagation(event);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    {space.logo_url ? (
                      <AvatarImage
                        src={space.logo_url}
                        alt={space.name || "Space"}
                      />
                    ) : null}

                    <AvatarFallback>
                      {space.name?.charAt(0)?.toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {space.name || "Unnamed Space"}
                    </div>

                    {space.slug && (
                      <div className="truncate text-xs text-muted-foreground">
                        /{space.slug}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
