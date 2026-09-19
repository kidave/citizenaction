"use client";

import { useEffect, useId, useState } from "react";
import { Building2, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ImageUpload from "@/components/media/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { moveGovernanceFile } from "@/lib/supabase/storage";
import { useImportGovernanceOrganizationImage } from "@/hooks/governance/useImportGovernanceOrganizationImage";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import { GOVERNANCE_STATUS_OPTIONS, GOVERNANCE_TYPES, formatGovernanceType, governanceRequiresValidTo } from "@/utils/governance";

function emptyForm(record) {
  return {
    name: record?.name || "",
    shortName: record?.short_name || "",
    description: record?.description || "",
    website: record?.website || "",
    type: record?.type || "organization",
    categoryId: record?.category_id || "",
    status: record?.status || "active",
    validFrom: record?.valid_from ? String(record.valid_from).slice(0, 10) : new Date().toISOString().slice(0, 10),
    validTo: record?.valid_to ? String(record.valid_to).slice(0, 10) : "",
    imageUrl: record?.image_url || "",
    imageSourceUrl: "",
  };
}

function isSupportedImageSource(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && (
      host === "instagram.com" ||
      host.endsWith(".instagram.com") ||
      host === "cdninstagram.com" ||
      host.endsWith(".cdninstagram.com") ||
      host === "fbcdn.net" ||
      host.endsWith(".fbcdn.net")
    );
  } catch {
    return false;
  }
}

export default function GovernanceOrganizationSheet({
  open,
  onOpenChange,
  categories = [],
  record = null,
  onSaved,
}) {
  const [form, setForm] = useState(() => emptyForm(record));
  const [saving, setSaving] = useState(false);
  const [importingImage, setImportingImage] = useState(false);
  const draftId = useId().replace(/:/g, "");
  const { createOrganization, updateOrganization } = useGovernanceCrud();
  const { importOrganizationImage } = useImportGovernanceOrganizationImage();

  const isEditing = Boolean(record?.id);
  const busy = saving || importingImage;
  const requiresValidTo = governanceRequiresValidTo(form.status);
  const imageSourceIsValid =
    !form.imageSourceUrl || isSupportedImageSource(form.imageSourceUrl.trim());

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setSaving(false);
      setImportingImage(false);

      if (!record?.id) {
        setForm(emptyForm(null));
        return;
      }

      const { data, error } = await supabase
        .from("governance")
        .select("id,name,short_name,description,website,type,category_id,status,valid_from,valid_to,image_url")
        .eq("id", record.id)
        .single();

      if (cancelled) return;

      if (error) {
        toast.error(error.message || "Unable to load organization");
        setForm(emptyForm(record));
        return;
      }

      setForm(emptyForm(data));
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, record?.id]);

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    if (!form.name.trim()) return toast.error("Organization name is required");
    if (!form.type) return toast.error("Governance type is required");
    if (!form.validFrom) return toast.error("Valid from is required");
    if (requiresValidTo && !form.validTo) {
      return toast.error("Add Valid to when the entity becomes inactive or deprecated");
    }
    if (form.validTo && form.validTo < form.validFrom) {
      return toast.error("Valid to cannot be earlier than valid from");
    }

    try {
      setSaving(true);
      const baseParams = {
        p_name: form.name.trim(),
        p_short_name: form.shortName.trim() || null,
        p_description: form.description.trim() || null,
        p_website: form.website.trim() || null,
        p_type: form.type,
        p_status: form.status,
        p_valid_from: `${form.validFrom}T00:00:00Z`,
        p_valid_to: form.validTo ? `${form.validTo}T23:59:59.999Z` : null,
        p_category_id: form.categoryId || null,
        p_image_url: form.imageUrl || null,
      };

      let saved = isEditing
        ? await updateOrganization({ ...baseParams, p_entity_id: record.id })
        : await createOrganization(baseParams);

      if (!isEditing && form.website.trim() && saved?.id) {
        saved = await updateOrganization({
          ...baseParams,
          p_entity_id: saved.id,
        });
      }

      let finalRecord = saved;

      if (!isEditing && form.imageUrl && saved?.id) {
        const marker = "/storage/v1/object/public/governance/";
        const imageUrl = form.imageUrl.split("?")[0];
        const markerIndex = imageUrl.indexOf(marker);
        const draftPath = markerIndex >= 0
          ? decodeURIComponent(imageUrl.slice(markerIndex + marker.length))
          : null;

        if (draftPath?.startsWith(`organization/draft-${draftId}/`)) {
          const extension = draftPath.split(".").pop() || "jpg";
          const finalPath = `organization/${saved.id}/logo.${extension}`;
          const publicUrl = await moveGovernanceFile(draftPath, finalPath);

          finalRecord = await updateOrganization({
            ...baseParams,
            p_entity_id: saved.id,
            p_image_url: publicUrl,
          });
        }
      }

      if (form.imageSourceUrl.trim()) {
        if (!imageSourceIsValid) throw new Error("Use an Instagram or Meta CDN image URL");
        if (!saved?.id) throw new Error("Organization was saved but no organization ID was returned.");

        setImportingImage(true);
        const imported = await importOrganizationImage({
          organizationId: saved.id,
          sourceUrl: form.imageSourceUrl.trim(),
        });

        finalRecord = await updateOrganization({
          ...baseParams,
          p_entity_id: saved.id,
          p_image_url: imported.imageUrl,
        });

        setImportingImage(false);
      }

      toast.success(isEditing ? "Organization updated" : "Organization created");
      await onSaved?.(finalRecord);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save organization");
    } finally {
      setImportingImage(false);
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 py-4 sm:px-6">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {isEditing ? "Edit organization" : "Add organization"}
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-4">
            <ImageUpload
              bucket="governance"
              path={isEditing ? `organization/${record.id}/logo` : `organization/draft-${draftId}/logo`}
              value={form.imageUrl || null}
              onChange={(value) => setField("imageUrl", value || "")}
              label="Organization logo"
              helperText="PNG, JPG or WebP · up to 5 MB"
              disabled={busy}
            />

            <div className="space-y-2">
              <Label>Or import from URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={form.imageSourceUrl}
                  onChange={(event) => setField("imageSourceUrl", event.target.value)}
                  placeholder="Paste Instagram image URL"
                  disabled={busy}
                />
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!imageSourceIsValid) return toast.error("Use an Instagram or Meta CDN image URL");
                      try {
                        setImportingImage(true);
                        const imported = await importOrganizationImage({ organizationId: record.id, sourceUrl: form.imageSourceUrl.trim() });
                        await updateOrganization({
                          p_entity_id: record.id,
                          p_name: form.name.trim(),
                          p_short_name: form.shortName.trim() || null,
                          p_description: form.description.trim() || null,
                          p_website: form.website.trim() || null,
                          p_type: form.type,
                          p_status: form.status,
                          p_valid_from: `${form.validFrom}T00:00:00Z`,
                          p_valid_to: form.validTo ? `${form.validTo}T23:59:59.999Z` : null,
                          p_category_id: form.categoryId || null,
                          p_image_url: imported.imageUrl,
                        });
                        setField("imageUrl", imported.imageUrl);
                        setField("imageSourceUrl", "");
                        toast.success("Image imported");
                      } catch (error) {
                        toast.error(error?.message || "Unable to import image");
                      } finally {
                        setImportingImage(false);
                      }
                    }}
                    disabled={busy || !form.imageSourceUrl.trim() || !imageSourceIsValid}
                  >
                    {importingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">{importingImage ? "Importing..." : "Import"}</span>
                  </Button>
                )}
              </div>
              {!imageSourceIsValid && <p className="text-xs text-destructive">Use an Instagram or Meta CDN image URL.</p>}
              {!isEditing && form.imageSourceUrl.trim() && imageSourceIsValid && (
                <p className="text-xs text-muted-foreground">The organization will be created first, then the image will be imported automatically.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="e.g. Mumbai Metropolitan Region Development Authority" disabled={busy} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Short name</Label>
                <Input value={form.shortName} onChange={(event) => setField("shortName", event.target.value)} placeholder="e.g. MMRDA" disabled={busy} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(value) => setField("type", value)} disabled={busy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GOVERNANCE_TYPES.map((item) => <SelectItem key={item} value={item}>{formatGovernanceType(item)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId || "none"} onValueChange={(value) => setField("categoryId", value === "none" ? "" : value)} disabled={busy}>
                  <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">No category</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setField("status", value)} disabled={busy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GOVERNANCE_STATUS_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valid from</Label>
                <Input type="date" value={form.validFrom} onChange={(event) => setField("validFrom", event.target.value)} disabled={busy} />
              </div>
              <div className="space-y-2">
                <Label>Valid to</Label>
                <Input type="date" value={form.validTo} onChange={(event) => setField("validTo", event.target.value)} disabled={busy} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Official website</Label>
                <Input type="url" value={form.website} onChange={(event) => setField("website", event.target.value)} placeholder="https://..." disabled={busy} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>What they do</Label>
                <Textarea value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="What is this organization for?" rows={5} disabled={busy} />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={busy}>Cancel</Button>
          <Button type="button" onClick={save} disabled={busy}>
            {busy ? (importingImage ? "Importing image..." : "Saving...") : isEditing ? "Save changes" : "Create organization"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
