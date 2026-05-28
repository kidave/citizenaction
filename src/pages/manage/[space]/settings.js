import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { useSpaces } from "@/hooks/useSpaces";
import { spaceUpdateSchema } from "@/schemas/space";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function SpaceSettings() {
  const router = useRouter();
  const slug = router.query.space;

  useRequireAuth();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(spaceUpdateSchema),
    defaultValues: {},
  });

  /* ---------- LOAD COMMUNITY ---------- */
  const { data: space, isLoading } = useSpaces({
    slug,
    privateAccess: true,
    enabled: !!slug,
  });

  useEffect(() => {
    if (!space) return;

    form.reset({
      name: space.name ?? undefined,
      description: space.description ?? undefined,
      email: space.email ?? undefined,
      website: space.website ?? undefined,
      contact_number: space.contact_number ?? undefined,
      primary_color: space.primary_color ?? undefined,
      logo_url: space.logo_url ?? undefined,
      cover_url: space.cover_url ?? undefined,
    });
  }, [space, form]);

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  /* ---------- SAVE ---------- */
  const confirmSave = async () => {
    setSaving(true);
    try {
      const values = form.getValues();

      const { data, error } = await supabase
        .from("space")
        .update(values)
        .eq("slug", slug)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Update blocked (RLS or membership issue)");
      }

      toast.success("Settings updated successfully");

      queryClient.setQueryData(["spaces", slug, undefined, true], data);

      await queryClient.invalidateQueries({
        queryKey: ["spaces", slug],
      });

      form.reset(data);
      setShowSaveDialog(false);
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
      const { error } = await supabase.from("space").delete().eq("slug", slug);

      if (error) throw error;

      toast.success("Space deleted");

      queryClient.removeQueries({
        queryKey: ["spaces", slug],
      });

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
        .from("space")
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
    await supabase.from("space").update({ logo_url: null }).eq("slug", slug);

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
        .from("space")
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
    await supabase.from("space").update({ cover_url: null }).eq("slug", slug);

    form.setValue("cover_url", null, { shouldDirty: true });
  };

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-md bg-muted"></div>
            <div>
              <div className="mb-2 h-7 w-48 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-muted/50"></div>
            </div>
          </div>
          <div className="h-10 w-40 animate-pulse rounded bg-muted"></div>
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          {/* Basic Info Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-10 animate-pulse rounded bg-muted"></div>
              <div className="h-24 animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>

          {/* Contact Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-5 w-36 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-10 animate-pulse rounded bg-muted"></div>
              <div className="h-10 animate-pulse rounded bg-muted"></div>
              <div className="h-10 animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>

          {/* Branding Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                <div className="h-16 w-16 animate-pulse rounded bg-muted"></div>
                <div className="h-10 animate-pulse rounded bg-muted"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                <div className="h-32 w-full animate-pulse rounded bg-muted"></div>
                <div className="h-10 animate-pulse rounded bg-muted"></div>
              </div>
            </CardContent>
          </Card>

          {/* Button area skeleton */}
          <div className="flex justify-between">
            <div className="h-10 w-24 animate-pulse rounded bg-muted"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 py-10">
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
              <h1 className="text-2xl font-semibold">Space Settings</h1>
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
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Space
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
                <Input {...form.register("name")} placeholder="Space name" />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-destructive">
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
                  <p className="mt-1 text-sm text-destructive">
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
                      <X className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>

                {form.watch("logo_url") ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={form.watch("logo_url")}
                        alt="Space logo"
                        width={32}
                        height={32}
                        className="h-20 w-20 rounded-lg border object-contain"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current logo. Upload a new one to replace.
                    </div>
                  </div>
                ) : (
                  <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed">
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
                      <X className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>

                {form.watch("cover_url") ? (
                  <div className="relative h-40 w-full max-w-md overflow-hidden rounded-lg border">
                    <Image
                      src={form.watch("cover_url")}
                      alt="Space cover"
                      fill
                      className="object-fit"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Current cover image. Upload a new one to replace.
                    </p>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
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
                    className="h-10 w-16 cursor-pointer p-1"
                  />
                  <Input
                    {...form.register("primary_color")}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose a primary color for your space
                </p>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!form.formState.isDirty || saving}
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
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
              Are you sure you want to save these changes? This will update your
              space settings.
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
            <AlertDialogTitle>Delete Space?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              space and all associated data including logo and cover images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Space"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
