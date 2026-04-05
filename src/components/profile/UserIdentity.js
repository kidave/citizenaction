"use client";

import { UserHoverCard } from "@/components/profile/UserHoverCard";
import Link from "next/link";

import { Row } from "@/components/layout/Row";
import { Stack } from "@/components/layout/Stack";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

/**
 * 🔥 Universal User Identity Component
 *
 * Use everywhere:
 * - Post header
 * - Tooltips
 * - Avatar groups
 * - Comments
 *
 * Supports:
 * - Hover profile preview
 * - Different sizes
 * - Optional name / timestamp
 */

export function UserIdentity({
  username,
  name,
  avatar,
  createdAt,

  hideName = false,
  hideTimestamp = false,

  size = "md", // "sm" | "md" | "lg"
}) {
  if (!username) return null;

  /* -------------------------
     SIZE SYSTEM
  ------------------------- */
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const avatarSize = sizeMap[size] || sizeMap.md;

  /* -------------------------
     UI
  ------------------------- */
  return (
    <UserHoverCard username={username}>
      <Link href={`/user/${username}`} className="group block">

        <Row className="items-center gap-2">

          {/* AVATAR */}
          <Avatar className={`${avatarSize} cursor-pointer`}>
            <AvatarImage src={avatar || undefined} />
            <AvatarFallback>
              {name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          {/* NAME + META */}
          {!hideName && (
            <Stack className="leading-tight" gap="gap-0">

              <span className="font-medium text-sm group-hover:underline">
                {name || "Anonymous"}
              </span>

              {!hideTimestamp && createdAt && (
                <span className="text-xs text-muted-foreground">
                  {createdAt}
                </span>
              )}

            </Stack>
          )}

        </Row>

      </Link>
    </UserHoverCard>
  );
}