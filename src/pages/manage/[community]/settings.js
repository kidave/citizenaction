import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Upload, X, Save } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useCommunities } from "@/hooks/useCommunities";
import { communityUpdateSchema } from "@/schemas/community";
import { supabase } from "@/lib/supabase/client";

export default function CommunitySettings() {
  const router = useRouter();
  const slug = router.query.community;

  useRequireAuth();
  const { user, loading: authLoading } = useAuth();

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(communityUpdateSchema),
    defaultValues: {},
  });

  /* ---------- LOAD COMMUNITY (PRIVATE MODE) ---------- */
  const {
    data: community,
    isLoading,
    error,
  } = useCommunities({
    slug,
    privateAccess: true,
    enabled: !!slug,
  });

  useEffect(() => {
    if (!community) return;

    form.reset({
      name: community.name ?? undefined,
      description: community.description ?? undefined,
      email: community.email ?? undefined,
      website: community.website ?? undefined,
      contact_number: community.contact_number ?? undefined,
      primary_color: community.primary_color ?? undefined,
      logo_url: community.logo_url ?? undefined,
      cover_url: community.cover_url ?? undefined,
    });
  }, [community, form]);

  const handleSave = () => {
    setShowSaveDialog(true);
  };
  
  /* ---------- SAVE ---------- */
  const confirmSave = async () => {
    setSaving(true);
    try {
      const values = form.getValues();

      const { data, error } = await supabase
        .from("community")
        .update(values)
        .eq("slug", slug)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Update blocked (RLS or membership issue)");
      }

      toast.success("Settings updated successfully");
      form.reset(values);
      setShowSaveDialog(false);
      router.back();
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  /* ---------- DELETE ---------- */
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("community")
        .delete()
        .eq("slug", slug);

      if (error) throw error;

      toast.success("Community deleted");
      router.push("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- LOGO UPLOAD ---------- */
  const uploadLogo = async (file) => {
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${slug}/logo.${fileExt}`;

      const { error } = await supabase.storage
        .from("community-branding")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("community-branding")
        .getPublicUrl(fileName);

      await supabase
        .from("community")
        .update({ logo_url: data.publicUrl })
        .eq("slug", slug);

      form.setValue("logo_url", data.publicUrl, { shouldDirty: true });
      toast.success("Logo updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const deleteLogo = async () => {
    await supabase
      .from("community")
      .update({ logo_url: null })
      .eq("slug", slug);

    form.setValue("logo_url", null, { shouldDirty: true });
  };

  /* ---------- COVER UPLOAD ---------- */
  const uploadCover = async (file) => {
    setUploadingCover(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${slug}/cover.${fileExt}`;

      const { error } = await supabase.storage
        .from("community-branding")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("community-branding")
        .getPublicUrl(fileName);

      await supabase
        .from("community")
        .update({ cover_url: data.publicUrl })
        .eq("slug", slug);

      form.setValue("cover_url", data.publicUrl, { shouldDirty: true });
      toast.success("Cover updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const deleteCover = async () => {
    await supabase
      .from("community")
      .update({ cover_url: null })
      .eq("slug", slug);

    form.setValue("cover_url", null, { shouldDirty: true });
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted animate-pulse rounded-md"></div>
            <div>
              <div className="h-7 w-48 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 w-32 bg-muted/50 animate-pulse rounded"></div>
            </div>
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded"></div>
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          {/* Basic Info Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-10 bg-muted animate-pulse rounded"></div>
              <div className="h-24 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>

          {/* Contact Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-5 w-36 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-10 bg-muted animate-pulse rounded"></div>
              <div className="h-10 bg-muted animate-pulse rounded"></div>
              <div className="h-10 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>

          {/* Branding Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                <div className="h-16 w-16 bg-muted animate-pulse rounded"></div>
                <div className="h-10 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-32 w-full bg-muted animate-pulse rounded"></div>
                <div className="h-10 bg-muted animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>

          {/* Button area skeleton */}
          <div className="flex justify-between">
            <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/manage/${slug}`}
              className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Community Settings</h1>
              {user?.email && (
                <p className="text-sm text-muted-foreground">
                  Logged in as {user?.email}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Community
              </>
            )}
          </Button>
        </div>

        <form className="space-y-6">
          {/* -------- BASIC INFO -------- */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Input {...form.register("name")} placeholder="Community name" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Textarea
                  {...form.register("description")}
                  placeholder="Description"
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* -------- CONTACT -------- */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input 
                {...form.register("email")} 
                placeholder="Email" 
                type="email"
              />
              <Input 
                {...form.register("website")} 
                placeholder="Website" 
                type="url"
              />
              <Input
                {...form.register("contact_number")}
                placeholder="Phone number"
              />
            </CardContent>
          </Card>

          {/* -------- BRANDING -------- */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Logo Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Logo</h3>
                  {form.watch("logo_url") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={deleteLogo}
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                
                {form.watch("logo_url") ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={form.watch("logo_url")}
                        alt="Community logo"
                        width={32}
                        height={32}
                        className="h-20 w-20 object-contain rounded-lg border"          
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current logo. Upload a new one to replace.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed rounded-lg">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        uploadLogo(e.target.files[0]);
                      }
                    }}
                    className="flex-1"
                  />
                  {uploadingLogo && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 256x256 pixels
                </p>
              </div>

              {/* Cover Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Cover Image</h3>
                  {form.watch("cover_url") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={deleteCover}
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                
                {form.watch("cover_url") ? (
                  <div className="relative h-40 w-full max-w-md rounded-lg border overflow-hidden">
                    <Image
                      src={form.watch("cover_url")}
                      alt="Community cover"
                      fill
                      className="object-fit"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Current cover image. Upload a new one to replace.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCover}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        uploadCover(e.target.files[0]);
                      }
                    }}
                    className="flex-1"
                  />
                  {uploadingCover && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 16:9 ratio, at least 1200x675 pixels
                </p>
              </div>

              {/* Theme Color */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Theme Color</h3>
                <div className="flex items-center gap-4">
                  <Input
                    type="color"
                    {...form.register("primary_color")}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    {...form.register("primary_color")}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose a primary color for your community
                </p>
              </div>

            </CardContent>
          </Card>
        </form>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          
          <Button 
            type="button"
            onClick={handleSave}
            disabled={!form.formState.isDirty || saving}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes? This will update your community settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your community
              and all associated data including logo and cover images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Community"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}