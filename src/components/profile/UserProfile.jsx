"use client";

import { useState } from "react";

import Link from "next/link";

import { MoreVertical, AlertTriangle } from "lucide-react";

import { usePublicProfile } from "@/hooks/user/usePublicProfile";
import { useDeleteAccountRequest } from "@/hooks/user/useDeleteAccountRequest";

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

import { toast } from "sonner";

export default function UserProfile({ username }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: profile, isLoading, error } = usePublicProfile(username);

  const { requestAccountDeletion, isSubmitting } = useDeleteAccountRequest();

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

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="px-4 py-16 text-center text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-6">
        <Card className="relative">
          {/* ======================================
              SELF PROFILE ACTIONS
          ====================================== */}

          {profile.is_self && (
            <div className="absolute right-3 top-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Profile options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/settings?tab=account">Edit Profile</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Request Account Deletion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* ======================================
              AVATAR
          ====================================== */}

          <div className="flex justify-center pt-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />

              <AvatarFallback>
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* ======================================
              IDENTITY
          ====================================== */}

          <CardHeader className="space-y-1 pb-2 pt-4 text-center">
            <h2 className="text-lg font-semibold">{profile.name}</h2>

            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </CardHeader>

          <Separator />

          {/* ======================================
              PROFILE INFORMATION
          ====================================== */}

          <CardContent className="space-y-4 pt-6">
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

            <ProfileItem label="Locality" value={profile.locality || "N/A"} />

            <Separator />

            <ProfileItem
              label="Member Since"
              value={new Date(profile.created_at).toLocaleDateString()}
            />
          </CardContent>
        </Card>
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

function ProfileItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="px-4 py-6">
      <Card>
        <div className="flex justify-center pt-8">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>

        <CardHeader className="space-y-2 pb-2 pt-4 text-center">
          <Skeleton className="mx-auto h-5 w-40" />
          <Skeleton className="mx-auto h-4 w-24" />
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
