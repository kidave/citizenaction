"use client";

import Link from "next/link";

import { Users, UserPlus, ArrowUpRight } from "lucide-react";

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
  const { data: members = [], isLoading } = useSpaceMembers({ spaceId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BecomeMemberCard spaceSlug={spaceSlug} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BecomeMemberCard spaceSlug={spaceSlug} />

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Link key={member.user_id} href={`/user/${member.username}`} className="group">
              <Card className="h-full overflow-hidden transition-colors hover:bg-muted/50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 shrink-0 border">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">
                            {member.name || "Unnamed User"}
                          </div>
                          <div className="truncate text-sm text-muted-foreground">
                            @{member.username}
                          </div>
                        </div>
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {member.designation && (
                      <div className="text-sm font-medium">{member.designation}</div>
                    )}

                    <div className="text-sm leading-6 text-muted-foreground">
                      {member.locality
                        ? `Based in ${member.locality}`
                        : "Citizen Action community member"}
                    </div>
                  </div>

                  <div className="mt-5 text-xs text-muted-foreground">
                    Member since {formatDate(member.created_at)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
