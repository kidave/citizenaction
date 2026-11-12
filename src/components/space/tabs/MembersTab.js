"use client";

import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import MemberCard from "@/components/space/MemberCard";

export default function MembersTab({ spaceId, spaceSlug }) {
  const { data: members = [], isLoading } = useSpaceMembers({
    spaceId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
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
            <MemberCard key={member.user_id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
