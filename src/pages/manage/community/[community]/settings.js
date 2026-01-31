import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
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
import { useAuth } from "context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { authFetch } from "@/lib/fetch";
import { communitySchema } from "@/schemas/community";
import { supabase } from "@/lib/supabase/client";

export default function CommunitySettings() {
  const router = useRouter();
  const slug = router.query.community;
  
  // Require authentication for this page
  useRequireAuth();
  const { session, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: "",
      description: "",
      email: "",
      website: "",
      contact_number: "",
      primary_color: "",
      logo_url: "",
      cover_url: "",
    },
  });

  // Load community data
  useEffect(() => {
    if (!slug || authLoading) return;

    const loadCommunity = async () => {
      try {
        console.log("Loading community data for:", slug);
        const data = await authFetch(`/api/community/${slug}/settings`);
        
        console.log("Loaded data:", data);
        
        form.reset({
          name: data.name || "",
          description: data.description || "",
          email: data.email || "",
          website: data.website || "",
          contact_number: data.contact_number || "",
          primary_color: data.primary_color || "",
          logo_url: data.logo_url || "",
          cover_url: data.cover_url || "",
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load community:", error);
        toast.error(error.message || "Failed to load community");
        setLoading(false);
        router.push("/");
      }
    };

    loadCommunity();
  }, [slug, form, router, authLoading]);

  // Upload logo directly with Supabase
  const uploadLogo = async (file) => {
    if (!file || !slug) return;

    setUploadingLogo(true);
    try {
      console.log("Starting logo upload for:", slug);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${slug}/logo.${fileExt}`;
      
      console.log("Uploading to:", fileName);
      
      // Upload directly to Supabase storage
      const { data, error } = await supabase.storage
        .from('community-branding')
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
        .from('community-branding')
        .getPublicUrl(fileName);

      console.log("Got public URL:", publicUrl);

      // Update database via API (this will handle ownership check)
      await authFetch(`/api/community/${slug}/settings`, {
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
      await authFetch(`/api/community/${slug}/settings`, {
        method: "PUT",
        body: JSON.stringify({ logo_url: null }),
      });
      
      form.setValue("logo_url", "", { shouldDirty: true });
      toast.success("Logo deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Upload cover directly with Supabase
  const uploadCover = async (file) => {
    if (!file || !slug) return;

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${slug}/cover.${fileExt}`;
      
      // Upload directly to Supabase storage
      const { data, error } = await supabase.storage
        .from('community-branding')
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
        .from('community-branding')
        .getPublicUrl(fileName);

      // Update database via API
      await authFetch(`/api/community/${slug}/settings`, {
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
      const response = await authFetch(`/api/community/${slug}/settings`, {
        method: "PUT",
        body: JSON.stringify({ cover_url: null }),
      });
      
      form.setValue("cover_url", "", { shouldDirty: true });
      toast.success("Cover image deleted");
    } catch (error) {
      console.error("Delete cover error:", {
        message: error.message,
        details: error.details,
        status: error.status
      });
      toast.error(`Failed to delete cover: ${error.message}`);
    }
  };

  // Save changes with confirmation
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
      const values = form.getValues();
      console.log("Saving values:", values);
      
      await authFetch(`/api/community/${slug}/settings`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      
      toast.success("Settings updated successfully");
      setShowSaveDialog(false);
      form.reset(values); // Reset form state to mark as not dirty
      router.back();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Delete community with dialog
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await authFetch(`/api/community/${slug}/settings`, {
        method: "DELETE",
      });
      
      toast.success("Community deleted successfully");
      setShowDeleteDialog(false);
      router.push("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete community");
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
              href={`/manage/community/${slug}`}
              className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Community Settings</h1>
              {session?.user?.email && (
                <p className="text-sm text-muted-foreground">
                  Logged in as {session.user.email}
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
                      <img
                        src={form.watch("logo_url")}
                        className="h-20 w-20 object-contain rounded-lg border"
                        alt="Community logo"
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
                  <div>
                    <img
                      src={form.watch("cover_url")}
                      className="h-40 w-full object-cover rounded-lg border"
                      alt="Community cover"
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