"use client";

import { useEffect, useId, useState } from "react";
import { Building2, Landmark, Link2, Loader2, Scale, Vote } from "lucide-react";
import { toast } from "sonner";
import { isValidGovernanceImageUrl, GOVERNANCE_IMAGE_URL_HELPER_TEXT } from "@/utils/governanceImageUrl";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { moveGovernanceFile } from "@/lib/supabase/storage";
import { useImportGovernanceOrganizationImage } from "@/hooks/governance/useImportGovernanceOrganizationImage";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import {
  GOVERNANCE_STATUS_OPTIONS,
  getDefaultGovernanceType,
  getGovernanceTypesForDomain,
  isGovernanceTypeAllowed,
  formatGovernanceType,
  governanceRequiresValidTo,
  GOVERNANCE_DOMAINS,
} from "@/utils/governance";

function emptyForm(record, defaultDomain = null) {
  const metadata = record?.metadata || {};
  const domain = defaultDomain ?? null;
  return {
    name: record?.name || "",
    shortName: record?.short_name || "",
    description: record?.description || "",
    website: record?.website || "",
    type: record?.type || getDefaultGovernanceType(domain),
    domain,
    categoryId: record?.category_id || "",
    status: record?.status || "active",
    validFrom: record?.valid_from
      ? String(record.valid_from).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    validTo: record?.valid_to ? String(record.valid_to).slice(0, 10) : "",
    imageUrl: record?.image_url || "",
    imageSourceUrl: "",
    email: record?.email || "",
    phone: record?.phone || "",
    address: record?.address || "",
    lat: metadata.office_lat == null ? null : Number(metadata.office_lat),
    lng: metadata.office_lng == null ? null : Number(metadata.office_lng),
    geographyId: record?.geography_id || "",
    parentEntityId: record?.parent_entity_id || "",
  };
}


export default function GovernanceOrganizationSheet({
  open,
  onOpenChange,
  categories = [],
  record = null,
  defaultDomain = null,
  onSaved,
  onAddressAction,
  onGeographyAction,
  onLinksAction,
}) {
  const [form, setForm] = useState(() => emptyForm(record, defaultDomain));
  const [saving, setSaving] = useState(false);
  const [importingImage, setImportingImage] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const draftId = useId().replace(/:/g, "");
  const { createOrganization, updateOrganization } = useGovernanceCrud();
  const { importOrganizationImage } = useImportGovernanceOrganizationImage();

  const isEditing = Boolean(record?.id);
  const busy = saving || importingImage;
  const requiresValidTo = governanceRequiresValidTo(form.status);
  const imageSourceIsValid =
    !form.imageSourceUrl || isValidGovernanceImageUrl(form.imageSourceUrl.trim());

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setSaving(false);
      setImportingImage(false);

      if (!record?.id) {
        setForm(emptyForm(null, defaultDomain));
        return;
      }

      const { data, error } = await supabase
        .from("governance")
        .select(
          "id,name,short_name,description,website,email,phone,address,type,domain,category_id,status,valid_from,valid_to,image_url,metadata,geography_id,parent_entity_id",
        )
        .eq("id", record.id)
        .single();

      if (cancelled) return;

      if (error) {
        toast.error(error.message || "Unable to load organization");
        setForm(emptyForm(record, defaultDomain));
        return;
      }

      setForm(emptyForm(data, defaultDomain));
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, record, defaultDomain]);

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const availableTypes = getGovernanceTypesForDomain(form.domain);
  const fixedType = availableTypes.length === 1;

  const save = async () => {
    if (!form.name.trim()) return toast.error("Organization name is required");
    if (!form.type || !isGovernanceTypeAllowed(form.domain, form.type)) {
      return toast.error("Choose an organisation type permitted by the selected domain");
    }
    if (!form.validFrom) return toast.error("Valid from is required");
    if (requiresValidTo && !form.validTo) {
      return toast.error(
        "Add Valid to when the entity becomes inactive or deprecated",
      );
    }
    if (form.validTo && form.validTo < form.validFrom) {
      return toast.error("Valid to cannot be earlier than valid from");
    }

    try {
      setSaving(true);
      const metadata = {
        ...(record?.metadata || {}),
        office_lat: Number.isFinite(form.lat) ? form.lat : null,
        office_lng: Number.isFinite(form.lng) ? form.lng : null,
      };
      const baseParams = {
        p_name: form.name.trim(),
        p_short_name: form.shortName.trim() || null,
        p_description: form.description.trim() || null,
        p_website: form.website.trim() || null,
        p_type: form.type,
        p_domain: defaultDomain ?? form.domain,
        p_parent_entity_id: isEditing ? form.parentEntityId || null : null,
        p_status: form.status,
        p_valid_from: `${form.validFrom}T00:00:00Z`,
        p_valid_to: form.validTo ? `${form.validTo}T23:59:59.999Z` : null,
        p_category_id: form.categoryId || null,
        p_image_url: form.imageUrl || null,
        p_email: form.email.trim() || null,
        p_phone: form.phone.trim() || null,
        p_address: form.address.trim() || null,
        p_metadata: metadata,
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
        const draftPath =
          markerIndex >= 0
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
        if (!imageSourceIsValid)
          throw new Error(GOVERNANCE_IMAGE_URL_HELPER_TEXT);
        if (!saved?.id)
          throw new Error(
            "Organization was saved but no organization ID was returned.",
          );

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
      }


      toast.success(
        isEditing ? "Organization updated" : "Organization created",
      );
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
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col gap-0 overflow-x-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b px-5 py-4 text-left sm:px-6">
          {(() => {
            const domainConfig = GOVERNANCE_DOMAINS.find((item) => item.value === (defaultDomain ?? form.domain));
            const DomainIcon = { politics: Vote, legislature: Landmark, executive: Building2, judiciary: Scale }[defaultDomain ?? form.domain] || Building2;
            const domainLabel = domainConfig?.label || "Other";
            const description = domainConfig
              ? "Add an organisation responsible for " + domainConfig.description.toLowerCase() + "."
              : "Add an organisation outside the four governance domains.";
            return (
              <div className="flex min-w-0 items-start gap-3">
                {isEditing ? (
                  <Avatar className="h-10 w-10 shrink-0 rounded-lg border">
                    <AvatarImage src={form.imageUrl || undefined} alt="" />
                    <AvatarFallback className="rounded-lg text-xs">{(form.name || "Organisation").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <DomainIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetTitle>{isEditing ? "Edit organisation" : "Add organisation"}</SheetTitle>
                    <Badge variant="secondary" className="font-normal">{domainLabel}</Badge>
                  </div>
                  <p className="text-sm font-normal text-muted-foreground">
                    {isEditing ? "Update this organisation’s details." : description}
                  </p>
                </div>
              </div>
            );
          })()}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-4">
            <ImageUpload
              bucket="governance"
              path={
                isEditing
                  ? `organization/${record.id}/logo`
                  : `organization/draft-${draftId}/logo`
              }
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
                  onChange={(event) =>
                    setField("imageSourceUrl", event.target.value)
                  }
                  placeholder="Paste direct image URL (HTTPS)"
                  disabled={busy}
                />
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!imageSourceIsValid)
                        return toast.error(
                          "Use a direct HTTPS image URL from a public website",
                        );
                      try {
                        setImportingImage(true);
                        const imported = await importOrganizationImage({
                          organizationId: record.id,
                          sourceUrl: form.imageSourceUrl.trim(),
                        });
                        await updateOrganization({
                          p_entity_id: record.id,
                          p_name: form.name.trim(),
                          p_short_name: form.shortName.trim() || null,
                          p_description: form.description.trim() || null,
                          p_website: form.website.trim() || null,
                          p_type: form.type,
                          p_domain: defaultDomain ?? form.domain,
                          p_parent_entity_id: isEditing ? record?.parent_entity_id || null : null,
                          p_status: form.status,
                          p_valid_from: `${form.validFrom}T00:00:00Z`,
                          p_valid_to: form.validTo
                            ? `${form.validTo}T23:59:59.999Z`
                            : null,
                          p_category_id: form.categoryId || null,
                          p_image_url: imported.imageUrl,
                          p_email: form.email.trim() || null,
                          p_phone: form.phone.trim() || null,
                          p_address: form.address.trim() || null,
                          p_metadata: {
                            ...(record?.metadata || {}),
                            office_lat: Number.isFinite(form.lat) ? form.lat : null,
                            office_lng: Number.isFinite(form.lng) ? form.lng : null,
                          },
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
                    disabled={
                      busy || !form.imageSourceUrl.trim() || !imageSourceIsValid
                    }
                  >
                    {importingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {importingImage ? "Importing..." : "Import"}
                    </span>
                  </Button>
                )}
              </div>
              {!imageSourceIsValid && (
                <p className="text-xs text-destructive">
                  {GOVERNANCE_IMAGE_URL_HELPER_TEXT}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="e.g. Mumbai Metropolitan Region Development Authority"
                  disabled={busy}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Short name</Label>
                <Input
                  value={form.shortName}
                  onChange={(event) => setField("shortName", event.target.value)}
                  placeholder="e.g. MMRDA"
                  disabled={busy}
                />
              </div>
              {fixedType ? (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
                    {formatGovernanceType(form.type)}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type || undefined} onValueChange={(value) => setField("type", value)} disabled={busy}>
                    <SelectTrigger><SelectValue placeholder="Select organisation type" /></SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((item) => <SelectItem key={item} value={item}>{formatGovernanceType(item)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId || "none"} onValueChange={(value) => setField("categoryId", value === "none" ? "" : value)} disabled={busy}>
                  <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                  </SelectContent>
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
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="office@example.gov.in" disabled={busy} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+91 ..." disabled={busy} />
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

        <SheetFooter className="relative z-10 flex-row shrink-0 items-center justify-between gap-3 border-t bg-background px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={busy}>
            {busy ? (importingImage ? "Importing image..." : "Saving...") : isEditing ? "Save changes" : "Create organization"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
