"use client";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

import { usePublicProfile } from "@/hooks/usePublicProfile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

/* ---------------------------
   Geographic hierarchy priority
   Lower number = higher scope
---------------------------- */
const SCOPE_PRIORITY = {
  country: 1,
  state: 2,
  region: 3,
  city: 4,
  ward: 5,
};

export function UserHoverCard({ username, children }) {
  const { data: profile, isLoading } =
    usePublicProfile(username);

  if (!username) return children;

  /* ---------------------------
     Sort clubs by hierarchy
  ---------------------------- */
  const sortedClubs = profile?.clubs
    ? [...profile.clubs].sort(
        (a, b) =>
          (SCOPE_PRIORITY[a.scope_type] || 999) -
          (SCOPE_PRIORITY[b.scope_type] || 999)
      )
    : [];

  const highestClub = sortedClubs[0];

  /* ---------------------------
     Get matching community
     based on highest club
  ---------------------------- */
  const primaryCommunity =
    profile?.communities?.find(
      (c) => c.id === highestClub?.community_id
    );

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
              <div className="flex items-center gap-4">
                <Image
                  src={profile.avatar_url || "/user1.png"}
                  width={56}
                  height={56}
                  className="rounded-full"
                  alt=""
                />
                <div>
                  <div className="font-semibold text-base">
                    {profile.name}
                  </div>

                  {highestClub && (
                    <div className="text-sm text-muted-foreground"> 
                      <Link
                        href={`/community/${highestClub.scope_type}/${highestClub.scope_code}`}
                      >
                        {highestClub.name}{" "}
                        {highestClub.geographic_name}
                      </Link>
                    </div>
                  )}

                </div>
              </div>

              {/* Primary Geographic Scope */}
              {primaryCommunity && (
                <div>
                  <Link
                    href={`/community/${primaryCommunity.slug}`}
                  >
                    <Badge variant="secondary" className="size-sm">{primaryCommunity.name}</Badge>
                  </Link>
                  <Link
                    href={`/user/${profile.username}`}
                    className="justify-end flex"
                  >
                    <Button variant="link" className="size-sm">View full profile</Button>
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
