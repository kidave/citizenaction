"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";

import ImageUpload from "@/components/media/ImageUpload";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
    avatar_url: "",
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
      avatar_url: profile.avatar_url || "",
      is_email_public: profile.is_email_public || false,
      is_mobile_public: profile.is_mobile_public || false,
    });
  }, [profile]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.id || !profile) return;

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
        avatar_url: form.avatar_url.trim() || null,
        is_email_public: form.is_email_public,
        is_mobile_public: form.is_mobile_public,
      });

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
    <div className="mx-auto max-w-2xl">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <ImageUpload
          bucket="avatars"
          path={`profile/${user.id}/avatar`}
          value={form.avatar_url || null}
          onChange={(url) => updateField("avatar_url", url || "")}
          label="Profile photo"
          helperText="PNG, JPG or WebP · up to 5 MB"
          className="flex justify-center"
          disabled={isUpdating}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-username">Username</Label>
            <Input id="profile-username" value={form.username} onChange={(event) => updateField("username", event.target.value)} />
            <p className="text-xs text-muted-foreground">Your username is used for your profile URL.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-designation">Designation</Label>
            <Input id="profile-designation" value={form.designation} onChange={(event) => updateField("designation", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-locality">Locality</Label>
            <Input id="profile-locality" value={form.locality} onChange={(event) => updateField("locality", event.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={form.email} disabled />
            </div>
            <div className={cn("flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors", form.is_email_public ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5")}>
              <div className="space-y-0.5">
                <p className={cn("text-sm font-medium", form.is_email_public ? "text-success" : "text-destructive")}>{form.is_email_public ? "Visible on your profile" : "Hidden from your profile"}</p>
                <p className="text-xs text-muted-foreground">{form.is_email_public ? "Others can see your email" : "Only you can see your email"}</p>
              </div>
              <Switch checked={form.is_email_public} onCheckedChange={(checked) => updateField("is_email_public", checked)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="profile-mobile">Mobile</Label>
              <Input id="profile-mobile" value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} />
            </div>
            <div className={cn("flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors", form.is_mobile_public ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5")}>
              <div className="space-y-0.5">
                <p className={cn("text-sm font-medium", form.is_mobile_public ? "text-success" : "text-destructive")}>{form.is_mobile_public ? "Visible on your profile" : "Hidden from your profile"}</p>
                <p className="text-xs text-muted-foreground">{form.is_mobile_public ? "Others can see your mobile number" : "Only you can see your mobile number"}</p>
              </div>
              <Switch checked={form.is_mobile_public} onCheckedChange={(checked) => updateField("is_mobile_public", checked)} />
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </div>
  );
}

function EditProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <CardContent className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6">
        <Skeleton className="h-24 w-24 rounded-full sm:col-span-2 sm:mx-auto" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-full sm:col-span-2" />
      </CardContent>
    </div>
  );
}
