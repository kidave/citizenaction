"use client";

import Link from "next/link";

import { Users, UserPlus } from "lucide-react";

import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";

export default function MembersTab({ spaceId, spaceSlug }) {
  const { data: members = [], isLoading } = useSpaceMembers({
    spaceId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BecomeMemberCard spaceSlug={spaceSlug} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />

                  <div className="flex-1 space-y-2">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================
          BECOME A MEMBER
      ======================================== */}

      <BecomeMemberCard spaceSlug={spaceSlug} />

      {/* ========================================
          MEMBERS
      ======================================== */}

      {!members.length ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No members yet</CardTitle>

            <CardDescription>
              This Space currently has no visible members.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => {
            return (
              <Link key={member.user_id} href={`/user/${member.username}`}>
                <Card className="h-full cursor-pointer bg-muted transition hover:bg-muted/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar_url || undefined} />

                        <AvatarFallback>
                          {member.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {member.name || "Unnamed User"}
                        </div>

                        <div className="truncate text-sm text-muted-foreground">
                          @{member.username}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BecomeMemberCard({ spaceSlug }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold">Become a member</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Join this Space to participate, contribute, and stay connected.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/space/${spaceSlug}/application/member`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Become a member
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
