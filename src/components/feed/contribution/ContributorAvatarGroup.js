"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function ContributorAvatarGroup({ contributors = [] }) {
  const [open, setOpen] = useState(false);

  if (!Array.isArray(contributors) || contributors.length === 0) {
    return null;
  }

  const uniqueContributors = Array.from(
    new Map(
      contributors.map((contributor) => [
        contributor.user_id ?? contributor.id ?? contributor.name,
        contributor,
      ]),
    ).values(),
  );

  const maxVisible = 5;

  const visibleContributors = uniqueContributors.slice(0, maxVisible);

  const hiddenCount = Math.max(
    uniqueContributors.length - maxVisible,
    0,
  );

  function stopPropagation(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <>
      <div
        className="flex items-center"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <AvatarGroup>
          {visibleContributors.map((contributor, index) => {
            const avatar =
              contributor.avatar_url || contributor.avatar || null;

            const key =
              contributor.user_id ??
              contributor.id ??
              `${contributor.name}-${index}`;

            return (
              <Avatar
                key={key}
                className="h-7 w-7 cursor-pointer transition-all hover:z-20 hover:scale-110"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(true);
                }}
              >
                {avatar ? (
                  <AvatarImage
                    src={avatar}
                    alt={contributor.name || "Contributor"}
                  />
                ) : null}

                <AvatarFallback>
                  {contributor.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            );
          })}

          {hiddenCount > 0 && (
            <Avatar
              className="h-7 w-7 cursor-pointer bg-muted text-xs transition-all hover:z-20 hover:scale-110"
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-hidden sm:max-w-md"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <SheetHeader>
            <SheetTitle>Contributors</SheetTitle>

            <SheetDescription>
              {uniqueContributors.length}{" "}
              {uniqueContributors.length === 1
                ? "Contributor"
                : "Contributors"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 overflow-y-auto">
            <div className="space-y-2">
              {uniqueContributors.map((contributor, index) => {
                const avatar =
                  contributor.avatar_url || contributor.avatar || null;

                const username = contributor.username || null;

                const key =
                  contributor.user_id ??
                  contributor.id ??
                  `${contributor.name}-${index}`;

                if (!username) {
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl p-2"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        {avatar ? (
                          <AvatarImage
                            src={avatar}
                            alt={contributor.name || "Contributor"}
                          />
                        ) : null}

                        <AvatarFallback>
                          {contributor.name?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {contributor.name || "Anonymous"}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={key}
                    href={`/user/${username}`}
                    onClick={(event) => {
                      stopPropagation(event);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      {avatar ? (
                        <AvatarImage
                          src={avatar}
                          alt={contributor.name || "Contributor"}
                        />
                      ) : null}

                      <AvatarFallback>
                        {contributor.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {contributor.name || "Anonymous"}
                      </div>

                      <div className="truncate text-xs text-muted-foreground">
                        @{username}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
