"use client";

import { useState } from "react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

import EntityListSheet from "@/components/profile/EntityListSheet";

export default function GovernanceAvatarGroup({
  authorities = [],
  maxVisible = 5,
}) {
  const [open, setOpen] = useState(false);

  if (!authorities?.length) return null;

  const uniqueAuthorities = Array.from(
    new Map(authorities.map((authority) => [authority.id, authority])).values(),
  );

  const visible = uniqueAuthorities.slice(0, maxVisible);

  const hiddenCount = uniqueAuthorities.length - maxVisible;

  return (
    <>
      <div className="flex items-center">
        <AvatarGroup>
          {visible.map((authority) => (
            <Avatar
              key={authority.id}
              className="h-7 w-7 cursor-pointer transition-all hover:z-20 hover:scale-110"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
            >
              <AvatarImage src={authority.image_url || undefined} />

              <AvatarFallback>
                {authority.label?.charAt(0)?.toUpperCase() || "G"}
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

      <EntityListSheet
        open={open}
        onOpenChange={setOpen}
        title="Tagged Authorities"
        items={uniqueAuthorities}
        type="authorities"
      />
    </>
  );
}
