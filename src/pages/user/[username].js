"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { usePublicProfile } from "@/hooks/usePublicProfile";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PublicProfilePage() {
  const router = useRouter();
  const { username } = router.query;

  const { data: profile, isLoading, error } = usePublicProfile(username);
  
  const primaryClub = profile?.primary_club;
  const primarySpace = profile?.primary_space;

  if (isLoading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 flex justify-center">
      <div className="w-full max-w-lg">
        <Card>

          {/* Avatar */}
          <div className="flex justify-center pt-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Identity */}
          <CardHeader className="text-center pt-4 pb-2 space-y-1">
            <h2 className="text-lg font-semibold">
              {profile.name}
            </h2>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-4">

            <ProfileItem
              label="Designation"
              value={profile.designation || "N/A"}
            />

            <ProfileItem
              label="Locality"
              value={profile.locality || "N/A"}
            />

            <ProfileItem
              label="Stakeholder"
              value={
                profile.stakeholder || "N/A"
              }
            />

            {/* Spaces */}
            {profile.spaces?.length > 0 && (
              <>
                <Separator />
                <ProfileItem
                  label="Spaces"
                  value={
                    <div className="flex flex-wrap gap-2 justify-end">
                      {profile.spaces.map((c) => (
                        <Link
                          key={c.id}
                          href={`/space/${c.slug}`}
                        >
                          <Badge
                            className="cursor-pointer"
                            style={{
                              backgroundColor:
                                c.primary_color || undefined,
                            }}
                          >
                            {c.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  }
                />
              </>
            )}

            {/* Clubs */}
            {profile.clubs?.length > 0 && (
              <ProfileItem
                label="Clubs"
                value={
                  <div className="flex flex-wrap gap-2 justify-end">
                    {primaryClub && primarySpace && (
                      <Link
                        href={`/space/${primarySpace.slug}/${primaryClub.scope_type}/${primaryClub.scope_code}`}
                      >
                        <Badge
                          variant="outline"
                          className="cursor-pointer"
                        >
                          {primaryClub.name}{" "}
                          {primaryClub.geographic_name}
                        </Badge>
                      </Link>
                    )}
                  </div>
                }
              />
            )}

            <Separator />

            <ProfileItem
              label="Member Since"
              value={new Date(profile.created_at).toLocaleDateString()}
            />

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* Same structure as private profile */

function ProfileItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-right">
        {value}
      </span>
    </div>
  );
}

/* Skeleton */

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 flex justify-center">
      <div className="w-full max-w-lg">
        <Card>
          <div className="flex justify-center pt-8">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>

          <CardHeader className="text-center pt-4 pb-2 space-y-2">
            <Skeleton className="h-5 w-40 mx-auto" />
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
