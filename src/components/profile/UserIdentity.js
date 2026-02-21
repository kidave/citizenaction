"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserHoverCard } from "@/components/profile/UserHoverCard";
import { formatDistanceToNow } from "date-fns";

export function UserIdentity({
  username,
  name,
  avatar,
  createdAt,
  hideName = false,
  hideTimestamp = false,
}) {
  return (
    <UserHoverCard username={username}>
      <Link
        href={`/user/${username}`}
        className="flex items-start gap-3 group"
      >
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={avatar || undefined} />
          <AvatarFallback>
            {name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        {/* 🔥 Only render text block if not hidden */}
        {!hideName && (
          <div className="flex flex-col leading-tight">
            <span className="font-semibold group-hover:underline">
              {name || "Anonymous"}
            </span>

            {!hideTimestamp && createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt))} ago
              </span>
            )}
          </div>
        )}
      </Link>
    </UserHoverCard>
  );
}