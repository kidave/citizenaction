"use client";

import { useState } from "react";

import { useRouter } from "next/router";
import Link from "next/link";

import { ArrowLeft, MoreVertical, AlertTriangle } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { usePublicProfile } from "@/hooks/user/usePublicProfile";

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

export default function PublicProfilePage() {
  const router = useRouter();

  const { username } = router.query;

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const { data: profile, isLoading, error } = usePublicProfile(username);

  const handleDeleteRequest = async () => {
    try {
      setSubmitting(true);

      const { error } = await supabase.from("delete_account_requests").insert({
        username: profile.username,
        user_id: profile.user_id,
      });

      if (error) throw error;

      toast.success("Account deletion request submitted");

      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
    <>
      <div className="flex min-h-screen justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {profile.is_self && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">Edit Profile</Link>
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
            <CardHeader className="space-y-1 pb-2 pt-4 text-center">
              <h2 className="text-lg font-semibold">{profile.name}</h2>

              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </CardHeader>

            <Separator />

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
      </div>

      {/* DELETE REQUEST DIALOG */}
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
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteRequest}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
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
    <div className="flex min-h-screen justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-4 flex justify-between">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>

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
    </div>
  );
}
