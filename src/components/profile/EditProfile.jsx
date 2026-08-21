"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";

import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

import { toast } from "sonner";

export default function EditProfile() {
  const router = useRouter();

  const { user } = useAuth();

  const { data: profile, isLoading } = useMyProfile();

  const { updateProfile, isUpdating } = useUpdateProfile();

  const [form, setForm] = useState({
    name: "",
    username: "",
    designation: "",
    locality: "",
    email: "",
    mobile: "",
    is_email_public: false,
    is_mobile_public: false,
  });

  /* ======================================
     LOAD PROFILE
  ====================================== */

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      name: profile.name || "",
      username: profile.username || "",
      designation: profile.designation || "",
      locality: profile.locality || "",
      email: profile.email || "",
      mobile: profile.mobile || "",
      is_email_public: profile.is_email_public || false,
      is_mobile_public: profile.is_mobile_public || false,
    });
  }, [profile]);

  /* ======================================
     UPDATE FIELD
  ====================================== */

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* ======================================
     SAVE
  ====================================== */

  const handleSave = async () => {
    if (!user?.id || !profile) {
      return;
    }

    const username = form.username.trim();

    if (!username) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      const updatedProfile = await updateProfile({
        userId: user.id,

        name: form.name.trim(),
        username,
        designation: form.designation.trim(),
        locality: form.locality.trim(),

        mobile: form.mobile.trim(),

        is_email_public: form.is_email_public,
        is_mobile_public: form.is_mobile_public,
      });

      toast.success("Profile updated");

      router.replace(`/user/${updatedProfile.username}`);
    } catch (err) {
      toast.error(err?.message || "Unable to update profile");
    }
  };

  /* ======================================
     LOADING
  ====================================== */

  if (isLoading || !profile) {
    return <EditProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* ======================================
          AVATAR
      ====================================== */}

      <div className="flex justify-center pt-7">
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
          <AvatarImage src={profile.avatar_url || undefined} />

          <AvatarFallback>
            {profile.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* ======================================
          FORM
      ====================================== */}

      <CardContent className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6">
        {/* ======================================
            NAME
        ====================================== */}

        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>

          <Input
            id="profile-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>

        {/* ======================================
            USERNAME
        ====================================== */}

        <div className="space-y-2">
          <Label htmlFor="profile-username">Username</Label>

          <Input
            id="profile-username"
            value={form.username}
            onChange={(event) => updateField("username", event.target.value)}
          />

          <p className="text-xs text-muted-foreground">
            Your username is used for your profile URL.
          </p>
        </div>

        {/* ======================================
            DESIGNATION
        ====================================== */}

        <div className="space-y-2">
          <Label htmlFor="profile-designation">Designation</Label>

          <Input
            id="profile-designation"
            value={form.designation}
            onChange={(event) => updateField("designation", event.target.value)}
          />
        </div>

        {/* ======================================
            LOCALITY
        ====================================== */}

        <div className="space-y-2">
          <Label htmlFor="profile-locality">Locality</Label>

          <Input
            id="profile-locality"
            value={form.locality}
            onChange={(event) => updateField("locality", event.target.value)}
          />
        </div>

        {/* EMAIL */}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>

            <Input id="profile-email" value={form.email} disabled />
          </div>

          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors",
              form.is_email_public
                ? "border-success/30 bg-success/5"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="space-y-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  form.is_email_public ? "text-success" : "text-destructive",
                )}
              >
                {form.is_email_public
                  ? "Visible on your profile"
                  : "Hidden from your profile"}
              </p>

              <p className="text-xs text-muted-foreground">
                {form.is_email_public
                  ? "Others can see your email"
                  : "Only you can see your email"}
              </p>
            </div>

            <Switch
              checked={form.is_email_public}
              onCheckedChange={(checked) =>
                updateField("is_email_public", checked)
              }
            />
          </div>
        </div>

        {/* MOBILE */}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="profile-mobile">Mobile</Label>

            <Input
              id="profile-mobile"
              value={form.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
            />
          </div>

          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors",
              form.is_mobile_public
                ? "border-success/30 bg-success/5"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="space-y-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  form.is_mobile_public ? "text-success" : "text-destructive",
                )}
              >
                {form.is_mobile_public
                  ? "Visible on your profile"
                  : "Hidden from your profile"}
              </p>

              <p className="text-xs text-muted-foreground">
                {form.is_mobile_public
                  ? "Others can see your mobile number"
                  : "Only you can see your mobile number"}
              </p>
            </div>

            <Switch
              checked={form.is_mobile_public}
              onCheckedChange={(checked) =>
                updateField("is_mobile_public", checked)
              }
            />
          </div>
        </div>

        {/* ======================================
            SAVE
        ====================================== */}

        <Button
          className="w-full sm:col-span-2"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </div>
  );
}

/* ============================================
   SKELETON
============================================ */

function EditProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Avatar */}

      <div className="flex justify-center pt-7">
        <Skeleton className="h-20 w-20 rounded-full sm:h-24 sm:w-24" />
      </div>

      {/* Form */}

      <CardContent className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6">
        {/* Name */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-56" />
        </div>

        {/* Designation */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Locality */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Email */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </div>

        {/* Save */}
        <Skeleton className="h-10 w-full sm:col-span-2" />
      </CardContent>
    </div>
  );
}
