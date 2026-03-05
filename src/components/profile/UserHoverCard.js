"use client";


import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Card } from "@/components/ui/card";
import { Row } from "@/components/layout/Row";
import { Stack } from "@/components/layout/Stack";

import { usePublicProfile } from "@/hooks/usePublicProfile";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function UserHoverCard({ username, children }) {
  const { data: profile, isLoading } =
    usePublicProfile(username);

  if (!username) return children;

  const primaryClub = profile?.primary_club;
  const primarySpace = profile?.primary_community;

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>

      <HoverCardContent
        sideOffset={4}
        align="start"
        className="w-80 p-0"
      >
        <Card className="p-5 border-none shadow-xl space-y-5">

          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading profile...
            </div>
          ) : profile ? (
            <>
              {/* Header */}
              <Row className="gap-4">
                <Image
                  src={profile.avatar_url || "/user1.png"}
                  width={56}
                  height={56}
                  className="rounded-full"
                  alt=""
                />
                <Stack gap="gap-0">
                  <div className="font-semibold text-base">
                    {profile.name}
                  </div>

                  {primaryClub && primarySpace && (
                    <div className="text-sm text-muted-foreground">
                      <Link
                        href={`/space/${primarySpace.slug}/${primaryClub.scope_type}/${primaryClub.scope_code}`}
                      >
                        {primaryClub.name}{" "}
                        {primaryClub.geographic_name}
                      </Link>
                    </div>
                  )}
                </Stack>
              </Row>

              {primarySpace && (
                <div>
                  <Link
                    href={`/space/${primarySpace.slug}`}
                  >
                    <Badge variant="secondary">
                      {primarySpace.name}
                    </Badge>
                  </Link>

                  <Link
                    href={`/user/${profile.username}`}
                    className="justify-end flex"
                  >
                    <Button variant="link" size="sm">
                      View full profile
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              User not found
            </div>
          )}
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
}