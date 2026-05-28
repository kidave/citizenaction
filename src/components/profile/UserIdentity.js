"use client";

import Link from "next/link";

import { Row } from "@/components/layout/Row";
import { Stack } from "@/components/layout/Stack";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function UserIdentity({
  username,
  name,
  avatar,
  createdAt,

  hideName = false,
  hideTimestamp = false,

  size = "md",
}) {
  if (!username) return null;

  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const avatarSize = sizeMap[size] || sizeMap.md;

  return (
    <Link href={`/user/${username}`} className="group block">
      <Row className="items-center gap-2">
        <Avatar className={avatarSize}>
          <AvatarImage src={avatar || undefined} />

          <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>

        {!hideName && (
          <Stack className="leading-tight" gap="gap-0">
            <span className="text-sm font-medium group-hover:underline">
              {name || "Anonymous"}
            </span>

            {!hideTimestamp && createdAt && (
              <span className="text-xs text-muted-foreground">{createdAt}</span>
            )}
          </Stack>
        )}
      </Row>
    </Link>
  );
}
