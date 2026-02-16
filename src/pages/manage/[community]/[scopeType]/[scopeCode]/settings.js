// pages/manage/[community]/[scopeType]/[scopeCode]/settings.js
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Upload, X, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { authFetch } from "@/lib/fetch";
import { clubUpdateSchema } from "@/schemas/club";
import { supabase } from "@/lib/supabase/client";

export default function ClubSettings() {
  const router = useRouter();
  const { community, scopeType, scopeCode } = router.query;
  
  useRequireAuth();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(clubUpdateSchema),
    defaultValues: {
      name: undefined,
      description: undefined,
      email: undefined,
      website: undefined,
      contact_number: undefined,
      primary_color: undefined,
      logo_url: undefined,
      cover_url: undefined,
    },
  });

  // Load club data
  useEffect(() => {
    if (!community || !scopeType || !scopeCode || authLoading) return;

    const loadClub = async () => {
      try {
        const data = await authFetch(`/api/club/${community}/${scopeType}/${scopeCode}`);
        
        form.reset({
          name: data.name ?? undefined,
          description: data.description ?? undefined,
          email: data.email ?? undefined,
          website: data.website ?? undefined,
          contact_number: data.contact_number ?? undefined,
          primary_color: data.primary_color ?? undefined,
          logo_url: data.logo_url ?? undefined,
          cover_url: data.cover_url ?? undefined,
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load club:", error);
        toast.error(error.message || "Failed to load club");
        setLoading(false);
        router.push(`/community/${community}`);
      }
    };

    loadClub();
  }, [community, scopeType, scopeCode, form, router, authLoading]);

  // Upload logo directly with Supabase
  const uploadLogo = async (file) => {
    if (!file || !community || !scopeType || !scopeCode) return;

    setUploadingLogo(true);
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${community}/${scopeType}/${scopeCode}/logo.${fileExt}`;
      
      // Upload directly to Supabase storage (committee-branding bucket)
      const { data, error } = await supabase.storage
        .from('committee-branding')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('committee-branding')
        .getPublicUrl(fileName);

      // Update database via API
      await authFetch(`/api/club/${community}/${scopeType}/${scopeCode}`, {
        method: "PUT",
        body: JSON.stringify({ logo_url: publicUrl }),
      });
      
      // Update form
      form.setValue("logo_url", publicUrl, { shouldDirty: true });
      toast.success("Logo updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Delete logo via API
  const deleteLogo = async () => {
    if (!confirm("Are you sure you want to delete the logo?")) return;
    
    try {
      await authFetch(`/api/club/${community}/${scopeType}/${scopeCode}`, {
        method: "PUT",
        body: JSON.stringify({ logo_url: null }),
      });
      
      form.setValue("logo_url", null, { shouldDirty: true });
      toast.success("Logo deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Upload cover directly with Supabase
  const uploadCover = async (file) => {
    if (!file || !community || !scopeType || !scopeCode) return;

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${community}/${scopeType}/${scopeCode}/cover.${fileExt}`;
      
      // Upload directly to Supabase storage
      const { data, error } = await supabase.storage
        .from('committee-branding')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('committee-branding')
        .getPublicUrl(fileName);

      // Update database via API
      await authFetch(`/api${community}/${scopeType}/${scopeCode}`, {
        method: "PUT",
        body: JSON.stringify({ cover_url: publicUrl }),
      });
      
      form.setValue("cover_url", publicUrl, { shouldDirty: true });
      toast.success("Cover image updated");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Delete cover via API
  const deleteCover = async () => {
    if (!confirm("Are you sure you want to delete the cover image?")) return;
    
    try {
      const response = await authFetch(`/api/club/${community}/${scopeType}/${scopeCode}`, {
        method: "PUT",
        body: JSON.stringify({ cover_url: null }),
      });
      
      form.setValue("cover_url", null, { shouldDirty: true });
      toast.success("Cover image deleted");
    } catch (error) {
      console.error("Delete cover error:", error);
      toast.error(`Failed to delete cover: ${error.message}`);
    }
  };

  // Save changes
  const handleSave = () => {
    if (form.formState.isDirty) {
      setShowSaveDialog(true);
    } else {
      toast.info("No changes to save");
    }
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      const dirty = form.formState.dirtyFields;

      const payload = Object.fromEntries(
        Object.keys(dirty).map((key) => [
          key,
          form.getValues(key),
        ])
      );

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        setShowSaveDialog(false);
        return;
      }

      await authFetch(
        `/api/club/${community}/${scopeType}/${scopeCode}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      toast.success("Settings updated successfully");
      setShowSaveDialog(false);

      // ✅ FIX: reset form correctly
      form.reset(form.getValues());

      router.back();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };


  // Delete club
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await authFetch(`/api/club/${community}/${scopeType}/${scopeCode}`, {
        method: "DELETE",
      });
      
      toast.success("Club deleted successfully");
      setShowDeleteDialog(false);
      router.push(`/community/${community}`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete club");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
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

        {/* Form skeleton - similar to community settings */}
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
              href={`/community/${community}/${scopeType}/${scopeCode}`}
              className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Club Settings</h1>
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
                Delete Club
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
                <Input {...form.register("name")} placeholder="Club name" />
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
                        className="h-20 w-20 object-contain rounded-lg border"
                        alt="Club logo"
                        height={32}
                        width={32}
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
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
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
              Are you sure you want to save these changes? This will update your club settings.
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
            <AlertDialogTitle>Delete Club?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your club
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
              {deleting ? "Deleting..." : "Delete Club"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}