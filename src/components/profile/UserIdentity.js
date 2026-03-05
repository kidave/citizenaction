"use client";

import { UserHoverCard } from "@/components/profile/UserHoverCard";
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
}) {
  return (
    <UserHoverCard username={username}>
      <Link
        href={`/user/${username}`}
        className="group"
      >
        <Row className="items-start gap-3">

          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={avatar || undefined} />
            <AvatarFallback>
              {name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          {!hideName && (
            <Stack className="leading-tight" gap="gap-0">

              <span className="font-semibold group-hover:underline">
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