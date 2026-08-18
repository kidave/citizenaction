"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";

import { Card, CardContent } from "@/components/ui/card";

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

  const { data: profile, isLoading, refetch } = useMyProfile();

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

  useEffect(() => {
    if (!profile) return;

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

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

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

        is_email_public: form.is_email_public,

        is_mobile_public: form.is_mobile_public,
      });

      await refetch();

      toast.success("Profile updated");

      router.replace(`/user/${updatedProfile.username}`);
    } catch (err) {
      toast.error(err?.message || "Unable to update profile");
    }
  };

  if (isLoading || !profile) {
    return <EditProfileSkeleton />;
  }

  return (
    <Card className="w-full">
      {/* ======================================
          AVATAR
      ====================================== */}

      <div className="flex justify-center pt-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatar_url || undefined} />

          <AvatarFallback>
            {profile.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* ======================================
          FORM
      ====================================== */}

      <CardContent className="space-y-6 p-6 sm:p-8">
        {/* NAME */}

        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>

          <Input
            id="profile-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>

        {/* USERNAME */}

        <div className="space-y-2">
          <Label htmlFor="profile-username">Username</Label>

          <Input
            id="profile-username"
            value={form.username}
            onChange={(event) => updateField("username", event.target.value)}
          />
        </div>

        {/* DESIGNATION */}

        <div className="space-y-2">
          <Label htmlFor="profile-designation">Designation</Label>

          <Input
            id="profile-designation"
            value={form.designation}
            onChange={(event) => updateField("designation", event.target.value)}
          />
        </div>

        {/* LOCALITY */}

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

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Public Email</span>

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

            <Input id="profile-mobile" value={form.mobile} disabled />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Public Mobile</span>

            <Switch
              checked={form.is_mobile_public}
              onCheckedChange={(checked) =>
                updateField("is_mobile_public", checked)
              }
            />
          </div>
        </div>

        {/* SAVE */}

        <Button className="w-full" onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

function EditProfileSkeleton() {
  return (
    <Card className="w-full">
      <div className="flex justify-center pt-8">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>

      <CardContent className="space-y-4 p-6 sm:p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
