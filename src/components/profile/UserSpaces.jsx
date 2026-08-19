"use client";

import Link from "next/link";
import { Users, Shield, ArrowUpRight } from "lucide-react";

import { useUserSpaces } from "@/hooks/user/useUserSpaces";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function SpaceSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}

function formatRole(role) {
  if (!role) {
    return "Member";
  }

  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function UserSpaces({ userId }) {
  const { data: spaces = [], isLoading, error } = useUserSpaces(userId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SpaceSkeleton />
        <SpaceSkeleton />
        <SpaceSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-sm text-destructive">Unable to load Spaces.</p>
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="font-semibold">No Spaces yet</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Spaces this user belongs to will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {spaces.map((space) => {
        const role = formatRole(space.role);

        return (
          <Link
            key={space.space_id}
            href={`/space/${space.space_slug}`}
            className="block"
          >
            <Card className="group p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                {/* SPACE IMAGE */}

                {space.space_logo ? (
                  <img
                    src={space.space_logo}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {/* SPACE INFO */}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{space.space_name}</p>

                  <div className="mt-1 flex items-center gap-2">
                    {space.is_owner ? (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Owner
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{role}</Badge>
                    )}
                  </div>
                </div>

                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
