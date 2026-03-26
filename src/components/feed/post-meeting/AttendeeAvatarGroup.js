"use client";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

export default function AttendeeAvatarGroup({ attendees = [] }) {
  if (!attendees || attendees.length === 0) return null;

  // ✅ Users (have avatar)
  const users = attendees.filter((a) => a?.avatar);

  // ✅ Guests (no user_id OR no avatar)
  const guests = attendees.filter((a) => !a?.avatar);

  const maxVisible = 5;
  const visibleUsers = users.slice(0, maxVisible);
  const extraUsers = users.length - maxVisible;

  return (
    <div className="flex items-center gap-2">

      {visibleUsers.length > 0 && (
        <AvatarGroup>
          {visibleUsers.map((a, i) => (
            <Avatar key={i} className="h-7 w-7">
              <AvatarImage src={a.avatar} />
              <AvatarFallback>
                {a.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      )}

      {extraUsers > 0 && (
        <span className="text-xs text-muted-foreground">
          +{extraUsers}
        </span>
      )}

      {guests.length > 0 && (
        <span className="text-xs text-muted-foreground">
          +{guests.length} guest{guests.length > 1 ? "s" : ""}
        </span>
      )}

    </div>
  );
}