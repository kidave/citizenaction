import { useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();


  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  // 🚨 HARD RENDER GUARD (prevents crash)
  if (authLoading || !user) {
    return null;
  }

  // Skeleton while profile loads
  if (profileLoading || !profile) {
    return <ProfileSkeleton />;
  }

  const mobile = profile.mobile ? `+${profile.mobile}` : "N/A";

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 flex justify-center">
      <div className="w-full max-w-lg">

        <div className="mb-4 h-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <Card>

          {/* Avatar */}
          <div className="flex justify-center pt-8">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={
                  profile.avatar_url ||
                  "/user1.png"
                }
                alt="Profile"
              />
              <AvatarFallback>
                {profile.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Identity */}
          <CardHeader className="text-center pt-4 pb-2 space-y-1">
            <h2 className="text-lg font-semibold">
              {profile.name || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {profile.email || user.email}
            </p>
          </CardHeader>

          {/* Details */}
          <CardContent className="pt-4">
            <div className="space-y-4">
              <ProfileItem label="Phone" value={mobile} />
              <ProfileItem
                label="Designation"
                value={profile.designation || "N/A"}
              />
              <ProfileItem
                label="Locality"
                value={profile.locality || "N/A"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

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

/* ---------- skeleton ---------- */

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 flex justify-center">
      <div className="w-full max-w-lg">

        {/* Back button placeholder */}
        <div className="mb-4 h-10" />

        <Card>
          <div className="flex justify-center pt-8">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>

          <CardHeader className="text-center pt-4 pb-2 space-y-2">
            <Skeleton className="h-5 w-40 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
