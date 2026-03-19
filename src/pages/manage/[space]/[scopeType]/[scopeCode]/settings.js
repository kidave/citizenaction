// pages/manage/[space]/[scopeType]/[scopeCode]/settings.js

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

import { ArrowLeft, Trash2, Save } from "lucide-react";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { clubUpdateSchema } from "@/schemas/club";
import { normalizeText } from "@/utils/normalize";
import { supabase } from "@/lib/supabase/client";

export default function ClubSettings() {
  const router = useRouter();
  const { space, scopeType, scopeCode } = router.query;

  useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(clubUpdateSchema),
    defaultValues: {
      name: undefined,
      description: undefined,
      email: undefined,
      contact_number: undefined,
    },
  });

  // 🔥 LOAD CLUB (DIRECT FROM SUPABASE)
  useEffect(() => {
    if (!space || !scopeType || !scopeCode) return;

    const loadClub = async () => {
      try {
        const { data, error } = await supabase
          .from("club_view")
          .select("*")
          .eq("community_slug", space)
          .eq("scope_type", scopeType)
          .eq("scope_code", scopeCode)
          .single();

        if (error) throw error;

        form.reset({
          name: data.name ?? undefined,
          description: data.description ?? undefined,
          email: data.email ?? undefined,
          contact_number: data.contact_number ?? undefined,
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load club");
        router.push(`/space/${space}`);
      }
    };

    loadClub();
  }, [space, scopeType, scopeCode, form, router]);

  // 🔥 SAVE
  const confirmSave = async () => {
    setSaving(true);

    try {
      const dirty = form.formState.dirtyFields;

      const payload = Object.fromEntries(
        Object.keys(dirty).map((key) => {
          let value = form.getValues(key);

          if (["name", "description", "email", "contact_number"].includes(key)) {
            value = normalizeText(value);
          }

          return [key, value];
        })
      );

      if (Object.keys(payload).length === 0) {
        toast.info("No changes");
        setShowSaveDialog(false);
        return;
      }

      const { error } = await supabase
        .from("club") // ⚠️ write to table
        .update(payload)
        .eq("community_slug", space)
        .eq("scope_type", scopeType)
        .eq("scope_code", scopeCode);

      if (error) throw error;

      toast.success("Updated successfully");
      form.reset(form.getValues());
      setShowSaveDialog(false);
      router.back();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // 🔥 DELETE
  const confirmDelete = async () => {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("club")
        .delete()
        .eq("community_slug", space)
        .eq("scope_type", scopeType)
        .eq("scope_code", scopeCode);

      if (error) throw error;

      toast.success("Club deleted");
      setShowDeleteDialog(false);
      router.push(`/space/${space}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/space/${space}/${scopeType}/${scopeCode}`}
              className="p-2 border rounded-md hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-semibold">Club Settings</h1>
          </div>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* FORM */}
        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input {...form.register("name")} placeholder="Club name" />
              <Textarea
                {...form.register("description")}
                placeholder="Description"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input {...form.register("email")} placeholder="Email" />
              <Input
                {...form.register("contact_number")}
                placeholder="Phone number"
              />
            </CardContent>
          </Card>
        </form>

        {/* ACTIONS */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>

          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={!form.formState.isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* SAVE DIALOG */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update your club settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete club?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}