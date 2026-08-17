"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

import EntityListSheet from "@/components/profile/EntityListSheet";

export default function ContributorAvatarGroup({ contributors = [] }) {
  const [open, setOpen] = useState(false);

  if (!contributors?.length) return null;

  const uniqueContributors = Array.from(
    new Map(
      contributors.map((contributor) => [contributor.id, contributor]),
    ).values(),
  );

  const maxVisible = 5;

  const visibleUsers = uniqueContributors.slice(0, maxVisible);

  const hiddenCount = uniqueContributors.length - maxVisible;

  return (
    <>
      <div
        className="flex items-center"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <AvatarGroup>
          {visibleUsers.map((contributor) => {
            const avatar = contributor.avatar || contributor.avatar_url;

            return (
              <Avatar
                key={contributor.id}
                className="h-7 w-7 cursor-pointer transition-all hover:z-20 hover:scale-110"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(true);
                }}
              >
                <AvatarImage src={avatar || undefined} />

                <AvatarFallback>
                  {contributor.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            );
          })}

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

      <EntityListSheet
        open={open}
        onOpenChange={setOpen}
        title="Contributors"
        items={uniqueContributors}
        type="contributors"
      />
    </>
  );
}
