"use client";

import { useRouter } from "next/router";
import Link from "next/link";

import { ArrowLeft, MoreVertical } from "lucide-react";

import { usePublicProfile } from "@/hooks/user/usePublicProfile";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PublicProfilePage() {
  const router = useRouter();

  const { username } = router.query;

  const {
    data: profile,
    isLoading,
    error,
  } = usePublicProfile(username);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

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

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {profile.is_self && (
            <DropdownMenu>

              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">

                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    Edit Profile
                  </Link>
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>
          )}

        </div>

        <Card>

          {/* Avatar */}
          <div className="flex justify-center pt-8">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profile.avatar_url || undefined}
              />

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

            <p className="text-sm text-muted-foreground">
              @{profile.username}
            </p>

          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-4">

            {profile.email && (
              <ProfileItem
                label="Email"
                value={profile.email}
              />
            )}

            {profile.mobile && (
              <ProfileItem
                label="Phone"
                value={`+${profile.mobile}`}
              />
            )}

            <ProfileItem
              label="Designation"
              value={profile.designation || "N/A"}
            />

            <ProfileItem
              label="Locality"
              value={profile.locality || "N/A"}
            />

            <Separator />

            <ProfileItem
              label="Member Since"
              value={new Date(
                profile.created_at
              ).toLocaleDateString()}
            />

          </CardContent>

        </Card>
      </div>
    </div>
  );
}

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

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 flex justify-center">
      <div className="w-full max-w-lg">

        <div className="mb-4 flex justify-between">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>

        <Card>

          <div className="flex justify-center pt-8">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>

          <CardHeader className="text-center pt-4 pb-2 space-y-2">
            <Skeleton className="h-5 w-40 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
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