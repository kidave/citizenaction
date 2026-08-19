"use client";

import { useState } from "react";
import Link from "next/link";

import {
  MoreVertical,
  AlertTriangle,
  FileText,
  Users,
  UserRound,
} from "lucide-react";

import { usePublicProfile } from "@/hooks/user/usePublicProfile";
import { useDeleteAccountRequest } from "@/hooks/user/useDeleteAccountRequest";

import UserPosts from "./UserPosts";
import UserSpaces from "./UserSpaces";
import UserContributions from "./UserContributions";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";

import { Separator } from "@/components/ui/separator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";

export default function UserProfile({ username }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const { data: profile, isLoading, error } = usePublicProfile(username);

  const { requestAccountDeletion, isSubmitting } = useDeleteAccountRequest();

  /* ======================================
     DELETE ACCOUNT
  ====================================== */

  const handleDeleteRequest = async () => {
    if (!profile) {
      return;
    }

    try {
      await requestAccountDeletion({
        username: profile.username,
        userId: profile.user_id,
      });

      toast.success("Account deletion request submitted");

      setDeleteOpen(false);
    } catch (err) {
      toast.error(err?.message || "Unable to submit account deletion request");
    }
  };

  /* ======================================
     LOADING
  ====================================== */

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  /* ======================================
     ERROR
  ====================================== */

  if (error || !profile) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        User not found
      </div>
    );
  }

  const displayName = profile.name || "Unnamed user";

  const initials = profile.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <div className="mx-auto w-full max-w-[720px]">
        {/* ======================================
            PROFILE HEADER
        ====================================== */}

        <section className="px-4 pb-5 pt-6 sm:px-0 sm:pt-8">
          <div className="flex items-start gap-5 sm:gap-8">
            {/* AVATAR */}

            <Avatar className="h-20 w-20 shrink-0 sm:h-28 sm:w-28">
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt={displayName}
              />

              <AvatarFallback className="text-xl sm:text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* PROFILE INFO */}

            <div className="min-w-0 flex-1">
              {/* NAME + ACTIONS */}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold sm:text-2xl">
                    {displayName}
                  </h1>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                </div>

                {/* SELF ACTIONS */}

                {profile.is_self && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Profile options"
                        className="shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={{
                            pathname: `/user/${profile.username}`,
                            query: {
                              edit: "true",
                            },
                          }}
                        >
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteOpen(true)}
                      >
                        Request Account Deletion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* STATS */}

              <div className="mt-5 flex items-center gap-5 sm:gap-8">
                <ProfileStat label="Posts" value="—" />

                <ProfileStat label="Contributions" value="—" />

                <ProfileStat label="Spaces" value="—" />
              </div>
            </div>
          </div>

          {/* SHORT PROFILE SUMMARY */}

          <div className="mt-5 space-y-1">
            {profile.designation && (
              <p className="text-sm font-medium">{profile.designation}</p>
            )}

            {profile.locality && (
              <p className="text-sm text-muted-foreground">
                {profile.locality}
              </p>
            )}
          </div>
        </section>

        {/* ======================================
            TABS
        ====================================== */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-12 w-full justify-around rounded-none border-y bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="h-full flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
            >
              <FileText className="h-4 w-4" />

              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>

            <TabsTrigger
              value="spaces"
              className="h-full flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
            >
              <Users className="h-4 w-4" />

              <span className="hidden sm:inline">Spaces</span>
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="h-full flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
            >
              <UserRound className="h-4 w-4" />

              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* ======================================
              POSTS TAB
          ====================================== */}

          <TabsContent value="posts" className="mt-0">
            <div className="space-y-8 py-5">
              {/* POSTS */}

              <section>
                <div className="px-4 pb-3 sm:px-0">
                  <h2 className="text-sm font-semibold">Posts</h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Posts made by {displayName}
                  </p>
                </div>

                <UserPosts userId={profile.user_id} />
              </section>

              {/* CONTRIBUTIONS */}

              <section>
                <div className="px-4 pb-3 sm:px-0">
                  <h2 className="text-sm font-semibold">Contributions</h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Contributions made by {displayName}
                  </p>
                </div>

                <UserContributions userId={profile.user_id} />
              </section>
            </div>
          </TabsContent>

          {/* ======================================
              SPACES TAB
          ====================================== */}

          <TabsContent value="spaces" className="mt-0 px-4 py-5 sm:px-0">
            <UserSpaces userId={profile.user_id} />
          </TabsContent>

          {/* ======================================
              PROFILE TAB
          ====================================== */}

          <TabsContent value="profile" className="mt-0 px-4 py-5 sm:px-0">
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold">Profile information</h2>
              </CardHeader>

              <CardContent className="space-y-4">
                {profile.email && (
                  <ProfileItem label="Email" value={profile.email} />
                )}

                {profile.mobile && (
                  <ProfileItem label="Phone" value={`+${profile.mobile}`} />
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
                  value={formatDate(profile.created_at)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ======================================
          DELETE REQUEST DIALOG
      ====================================== */}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <DialogTitle className="text-center">
              Request Account Deletion
            </DialogTitle>

            <DialogDescription className="text-center">
              This will submit a request to permanently delete your account and
              associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            This action cannot be undone once processed.
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ============================================
   PROFILE STAT
============================================ */

function ProfileStat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-base font-semibold">{value}</p>

      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/* ============================================
   PROFILE ITEM
============================================ */

function ProfileItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>

      <span className="min-w-0 break-words text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

/* ============================================
   DATE
============================================ */

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/* ============================================
   SKELETON
============================================ */

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div className="px-4 pb-5 pt-6 sm:px-0 sm:pt-8">
        <div className="flex items-start gap-5 sm:gap-8">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full sm:h-28 sm:w-28" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />

            <div className="flex gap-7 pt-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>

        <Skeleton className="mt-5 h-4 w-32" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>

      <div className="h-12 border-y" />

      <div className="space-y-4 px-4 py-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
