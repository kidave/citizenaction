"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";

import { Skeleton } from "@/components/ui/skeleton";

import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const { data: profile, isLoading, refetch } = useMyProfile();

  const [saving, setSaving] = useState(false);

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
    if (profile) {
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
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const oldUsername = profile.username;

      const { error } = await supabase
        .from("profile")
        .update({
          name: form.name,
          username: form.username,
          designation: form.designation,
          locality: form.locality,

          is_email_public: form.is_email_public,

          is_mobile_public: form.is_mobile_public,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refetch();

      toast.success("Profile updated");

      if (oldUsername !== form.username && form.username) {
        router.replace(`/user/${form.username}`);

        return;
      }

      router.replace(`/user/${profile.username}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isLoading || !profile) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="flex min-h-dvh justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
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

          <CardHeader className="text-center">
            <h2 className="text-lg font-semibold">Profile Settings</h2>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>

              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label>Username</Label>

              <Input
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
              />
            </div>

            {/* Designation */}
            <div className="space-y-2">
              <Label>Designation</Label>

              <Input
                value={form.designation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    designation: e.target.value,
                  })
                }
              />
            </div>

            {/* Locality */}
            <div className="space-y-2">
              <Label>Locality</Label>

              <Input
                value={form.locality}
                onChange={(e) =>
                  setForm({
                    ...form,
                    locality: e.target.value,
                  })
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-3">
              <div>
                <Label>Email</Label>

                <Input value={form.email} disabled />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Public Email</span>

                <Switch
                  checked={form.is_email_public}
                  onCheckedChange={(v) =>
                    setForm({
                      ...form,
                      is_email_public: v,
                    })
                  }
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-3">
              <div>
                <Label>Mobile</Label>

                <Input value={form.mobile} disabled />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Public Mobile</span>

                <Switch
                  checked={form.is_mobile_public}
                  onCheckedChange={(v) =>
                    setForm({
                      ...form,
                      is_mobile_public: v,
                    })
                  }
                />
              </div>
            </div>

            {/* Save */}
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="flex min-h-dvh justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-lg">
        <Card>
          <div className="flex justify-center pt-8">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>

          <CardContent className="space-y-4 pt-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
