"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUpload from "@/components/media/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { supabase } from "@/lib/supabase/client";

function emptyForm() {
  return {
    name: "",
    biography: "",
    website: "",
    imageUrl: "",
    profileUserId: "",
  };
}

export default function GovernancePersonDialog({ open, onOpenChange, record = null, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const draftId = useId().replace(/:/g, "");

  const isEditing = !!record?.id;
  const imagePath = isEditing
    ? `governance/person/${record.id}/image`
    : `governance/person/draft-${draftId}/image`;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setLoadingRecord(isEditing);

      const [profileResult, personResult] = await Promise.all([
        supabase
          .from("profile")
          .select("user_id,name,username")
          .order("name")
          .limit(1000),
        isEditing
          ? supabase
              .from("person")
              .select("id,name,biography,website,image_url,profile_user_id,metadata")
              .eq("id", record.id)
              .single()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (cancelled) return;

      if (profileResult.error) {
        toast.error(profileResult.error.message);
        setLoadingRecord(false);
        return;
      }
      if (personResult.error) {
        toast.error(personResult.error.message);
        setLoadingRecord(false);
        return;
      }

      const person = personResult.data;
      setProfiles(profileResult.data || []);
      setForm(
        person
          ? {
              name: person.name || "",
              biography: person.biography || "",
              website: person.website || "",
              imageUrl: person.image_url || "",
              profileUserId: person.profile_user_id || "",
            }
          : emptyForm(),
      );
      setLoadingRecord(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, record?.id, isEditing]);

  const profileOptions = useMemo(
    () => [
      { value: "none", label: "No linked profile", searchValue: "no linked profile" },
      ...profiles.map((item) => ({
        value: item.user_id,
        label: item.name || item.username || "Unnamed profile",
        searchValue: `${item.name || ""} ${item.username || ""}`,
      })),
    ],
    [profiles],
  );

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Person name is required");
      return;
    }

    try {
      setLoading(true);
      const rpc = isEditing ? "update_person" : "create_person";
      const params = isEditing
        ? {
            p_person_id: record.id,
            p_name: form.name.trim(),
            p_biography: form.biography.trim() || null,
            p_website: form.website.trim() || null,
            p_image_url: form.imageUrl.trim() || null,
            p_profile_user_id: form.profileUserId === "none" ? null : form.profileUserId || null,
            p_metadata: null,
          }
        : {
            p_name: form.name.trim(),
            p_biography: form.biography.trim() || null,
            p_website: form.website.trim() || null,
            p_image_url: form.imageUrl.trim() || null,
            p_profile_user_id: form.profileUserId === "none" ? null : form.profileUserId || null,
            p_metadata: {},
          };

      const result = await supabase.rpc(rpc, params);
      if (result.error) throw result.error;

      toast.success(isEditing ? "Person updated" : "Person created");
      await onSaved?.(result.data);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            {isEditing ? "Edit person" : "Add person"}
          </DialogTitle>
        </DialogHeader>

        {loadingRecord ? (
          <div className="space-y-3 py-4">
            <div className="h-9 animate-pulse rounded-md bg-muted" />
            <div className="h-20 animate-pulse rounded-md bg-muted" />
            <div className="h-9 animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <ImageUpload
              bucket="governance"
              path={imagePath}
              value={form.imageUrl || null}
              onChange={(value) => setField("imageUrl", value || "")}
              label="Person image"
              helperText="PNG, JPG or WebP · up to 5 MB"
              disabled={loading}
            />

            <div className="space-y-2">
              <Label htmlFor="governance-person-name">Name</Label>
              <Input id="governance-person-name" value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="e.g. Jane Doe" disabled={loading} autoFocus />
            </div>

            <div className="space-y-2">
              <Label>Linked profile</Label>
              <SearchableSelect value={form.profileUserId || "none"} onValueChange={(value) => setField("profileUserId", value)} options={profileOptions} placeholder="No linked profile" searchPlaceholder="Search profiles..." emptyText="No profiles found." disabled={loading} />
              <p className="text-xs text-muted-foreground">Link this governance person to an existing Citizen Action profile when they represent the same person.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="governance-person-biography">Biography</Label>
              <Textarea id="governance-person-biography" value={form.biography} onChange={(event) => setField("biography", event.target.value)} placeholder="Short biography or background" rows={4} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="governance-person-website">Website</Label>
              <Input id="governance-person-website" type="url" value={form.website} onChange={(event) => setField("website", event.target.value)} placeholder="https://..." disabled={loading} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={loading}>Cancel</Button>
          <Button type="button" onClick={save} disabled={loading || loadingRecord}>{loading ? "Saving..." : isEditing ? "Save changes" : "Create person"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
