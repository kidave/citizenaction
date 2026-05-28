"use client";

import Link from "next/link";
import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Skeleton } from "@/components/ui/skeleton";

export default function MembersTab({ spaceId }) {
  const { data: members = [], isLoading } = useSpaceMembers({ spaceId });

  if (isLoading) {
    return (
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
    );
  }

  if (!members.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle> No members yet </CardTitle>

          <CardDescription>
            {" "}
            This space currently has no visible members.{" "}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          return (
            <Link key={member.user_id} href={`/user/${member.username}`}>
              <Card className="h-full cursor-pointer transition">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar_url || undefined} />

                        <AvatarFallback>
                          {" "}
                          {member.name?.[0]?.toUpperCase() || "U"}{" "}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {" "}
                          {member.name || "Unnamed User"}{" "}
                        </div>

                        <div className="truncate text-sm text-muted-foreground">
                          {" "}
                          @{member.username}{" "}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
