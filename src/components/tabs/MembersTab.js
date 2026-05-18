"use client";

import Link from "next/link";

import {
  Users,
  Shield,
  Briefcase,
  MapPin,
} from "lucide-react";

import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";

const roleStyles = {
  owner:
    "bg-yellow-100 text-yellow-800 border-yellow-200",

  admin:
    "bg-blue-100 text-blue-800 border-blue-200",

  moderator:
    "bg-purple-100 text-purple-800 border-purple-200",

  member:
    "bg-muted text-muted-foreground",
};

export default function MembersTab({
  spaceId,
}) {
  const {
    data: members = [],
    isLoading,
  } = useSpaceMembers({
    spaceId,
  });

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-4
        "
      >
        {Array.from({
          length: 6,
        }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-4">

              <div className="flex items-center gap-3">

                <Skeleton className="h-12 w-12 rounded-full" />

                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />

                  <Skeleton className="h-3 w-20" />
                </div>

              </div>

              <Skeleton className="h-3 w-full" />

              <Skeleton className="h-3 w-2/3" />

            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!members.length) {
    return (
      <Card className="border-dashed">

        <CardHeader>

          <CardTitle>
            No members yet
          </CardTitle>

          <CardDescription>
            This space currently has
            no visible members.
          </CardDescription>

        </CardHeader>

      </Card>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">

        <Users className="h-4 w-4" />

        <span>
          {members.length} member
          {members.length !== 1
            ? "s"
            : ""}
        </span>

      </div>

      {/* GRID */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-4
        "
      >

        {members.map((member) => {

          const roleStyle =
            roleStyles[
              member.role
            ] ||
            roleStyles.member;

          return (
            <Link
              key={member.user_id}
              href={`/user/${member.username}`}
            >

              <Card
                className="
                  h-full
                  transition
                  hover:shadow-md
                  hover:border-primary/30
                  cursor-pointer
                "
              >

                <CardContent className="p-4 space-y-4">

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">

                      <Avatar className="h-12 w-12">

                        <AvatarImage
                          src={
                            member.avatar_url ||
                            undefined
                          }
                        />

                        <AvatarFallback>
                          {member.name?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>

                      </Avatar>

                      <div className="min-w-0">

                        <div className="font-medium truncate">
                          {member.name ||
                            "Unnamed User"}
                        </div>

                        <div className="text-sm text-muted-foreground truncate">
                          @{member.username}
                        </div>

                      </div>

                    </div>

                    <Badge
                      variant="outline"
                      className={roleStyle}
                    >

                      <Shield className="h-3 w-3 mr-1" />

                      {member.role}

                    </Badge>

                  </div>

                  {/* DESIGNATION */}

                  {member.designation && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

                      <Briefcase className="h-4 w-4 shrink-0" />

                      <span className="line-clamp-1">
                        {member.designation}
                      </span>

                    </div>
                  )}

                  {/* LOCALITY */}

                  {member.locality && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

                      <MapPin className="h-4 w-4 shrink-0" />

                      <span className="line-clamp-1">
                        {member.locality}
                      </span>

                    </div>
                  )}

                </CardContent>

              </Card>

            </Link>
          );
        })}

      </div>

    </div>
  );
}