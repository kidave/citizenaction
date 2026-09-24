"use client";

import { useState } from "react";
import Link from "next/link";

import {
  MoreVertical,
  AlertTriangle,
  FileText,
  Users,
  MessageSquare,
} from "lucide-react";

import { usePublicProfile } from "@/hooks/user/usePublicProfile";
import { useDeleteAccountRequest } from "@/hooks/user/useDeleteAccountRequest";
import { useUserProfileStats } from "@/hooks/user/useUserProfileStats";

import UserPosts from "./UserPosts";
import UserSpaces from "./UserSpaces";
import UserContributions from "./UserContributions";

import UserProfileSkeleton from "@/components/skeletons/UserProfileSkeleton";

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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";

export default function UserProfile({ username }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  /* ======================================
     PROFILE
  ====================================== */

  const { data: profile, isLoading, error } = usePublicProfile(username);

  /* ======================================
     PROFILE STATS
  ====================================== */

  const { data: stats } = useUserProfileStats(profile?.user_id);

  /* ======================================
     ACCOUNT DELETION
  ====================================== */

  const { requestAccountDeletion, isSubmitting } = useDeleteAccountRequest();

  /* ======================================
     LOADING
  ====================================== */

  if (isLoading) {
    return <UserProfileSkeleton />;
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

  /* ======================================
     DISPLAY DATA
  ====================================== */

  const displayName = profile.name || "Unnamed user";

  const initials = profile.name?.charAt(0)?.toUpperCase() || "U";

  /* ======================================
     DELETE ACCOUNT
  ====================================== */

  const handleDeleteRequest = async () => {
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

  return (
    <>
      {/* ======================================
          PROFILE
      ====================================== */}

      <div className="w-full">
        {/* ======================================
            PROFILE HEADER
        ====================================== */}

        <section className="px-4 pb-5 pt-6 sm:px-6 sm:pt-8">
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

                {/* SELF PROFILE MENU */}

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
                      {/* EDIT PROFILE */}

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

                      {/* DELETE ACCOUNT */}

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

              {/* ======================================
                  STATS
              ====================================== */}

              <div className="mt-5 flex items-center gap-5 sm:gap-8">
                {/* POSTS */}

                <div>
                  <p className="text-base font-semibold">
                    {stats?.post_count ?? 0}
                  </p>

                  <p className="text-xs text-muted-foreground">Post</p>
                </div>

                {/* CONTRIBUTIONS */}

                <div>
                  <p className="text-base font-semibold">
                    {stats?.contribution_count ?? 0}
                  </p>

                  <p className="text-xs text-muted-foreground">Contribution</p>
                </div>

                {/* SPACES */}

                <div>
                  <p className="text-base font-semibold">
                    {stats?.space_count ?? 0}
                  </p>

                  <p className="text-xs text-muted-foreground">Space</p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================
              SUMMARY
          ====================================== */}

          {(profile.designation || profile.locality) && (
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
          )}
        </section>

        {/* ======================================
            TABS
        ====================================== */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* TAB NAVIGATION */}

          <TabsList className="h-12 w-full rounded-none border-y bg-transparent p-0">
            {/* POSTS */}

            <TabsTrigger
              value="posts"
              className="h-full flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
            >
              <FileText className="h-4 w-4" />

              <span className="hidden sm:inline">Post</span>
            </TabsTrigger>

            {/* CONTRIBUTIONS */}

            <TabsTrigger
              value="contributions"
              className="h-full flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
            >
              <MessageSquare className="h-4 w-4" />

              <span className="hidden sm:inline">Contribution</span>
            </TabsTrigger>

            {/* SPACES */}

            <TabsTrigger
              value="spaces"
              className="h-full flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
            >
              <Users className="h-4 w-4" />

              <span className="hidden sm:inline">Space</span>
            </TabsTrigger>
          </TabsList>

          {/* ======================================
              POSTS
          ====================================== */}

          <TabsContent value="posts" className="mt-0">
            <UserPosts userId={profile.user_id} />
          </TabsContent>

          {/* ======================================
              CONTRIBUTIONS
          ====================================== */}

          <TabsContent value="contributions" className="mt-0">
            <UserContributions userId={profile.user_id} />
          </TabsContent>

          {/* ======================================
              SPACES
          ====================================== */}

          <TabsContent value="spaces" className="mt-0">
            <UserSpaces userId={profile.user_id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ======================================
          DELETE ACCOUNT DIALOG
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
