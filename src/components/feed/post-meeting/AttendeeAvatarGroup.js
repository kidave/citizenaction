"use client";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

export default function AttendeeAvatarGroup({ attendees = [] }) {
  const validAttendees = attendees.filter((a) => a?.avatar);

  if (!attendees || attendees.length === 0) return null;

  return (
    <div className="flex items-center gap-2">

      {validAttendees.length > 0 && (
        <AvatarGroup>
          {validAttendees.slice(0, 5).map((a, i) => (
            <Avatar key={i} className="h-7 w-7">
              <AvatarImage src={a.avatar} />
              <AvatarFallback>
                {a.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      )}

      <span className="text-xs text-muted-foreground">
        {attendees.length} attendees
      </span>

      {validAttendees.length > 5 && (
        <span className="text-xs text-muted-foreground">
          +{validAttendees.length - 5}
        </span>
      )}

    </div>
  );
}