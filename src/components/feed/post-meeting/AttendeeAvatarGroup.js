"use client";

import Link from "next/link";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

export default function AttendeeAvatarGroup({ attendees = [] }) {
  if (!attendees || attendees.length === 0) return null;

  const users = attendees.filter(
    (a) => (a?.avatar || a?.avatar_url) && a?.username
  );

  const maxVisible = 5;
  const visibleUsers = users.slice(0, maxVisible);

  return (
    <div className="flex items-center gap-2">
      {visibleUsers.length > 0 && (
        <AvatarGroup>
          {visibleUsers.map((a, i) => {
            const avatarSrc =
              a.avatar || a.avatar_url;

            return (
              <Link
                key={i}
                href={`/user/${a.username}`}
                className="transition hover:scale-105"
              >
                <Avatar className="h-7 w-7 cursor-pointer">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback>
                    {a.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            );
          })}
        </AvatarGroup>
      )}
    </div>
  );
}