"use client";

import { useEffect, useId, useState } from "react";
import { Loader2, Link2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { isValidGovernanceImageUrl, GOVERNANCE_IMAGE_URL_HELPER_TEXT } from "@/utils/governanceImageUrl";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ImageUpload from "@/components/ui/ImageUpload";
import { moveGovernanceFile } from "@/lib/supabase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useImportGovernancePersonImage } from "@/hooks/governance/useImportGovernancePersonImage";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";

function emptyForm() {
  return {
    name: "",
    biography: "",
    imageUrl: "",
    imageSourceUrl: "",
  };
}


export default function GovernancePersonSheet({
  open,
  onOpenChange,
  record = null,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [importingImage, setImportingImage] = useState(false);
  const draftId = useId().replace(/:/g, "");

  const isEditing = !!record?.id;
  const imagePath = isEditing
    ? `person/${record.id}`
    : `person/draft-${draftId}`;

  const { createPerson, updatePerson } = useGovernanceCrud();
  const { importPersonImage } = useImportGovernancePersonImage();

  const imageSourceIsValid =
    !form.imageSourceUrl || isValidGovernanceImageUrl(form.imageSourceUrl.trim());

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setLoadingRecord(isEditing);

      const personResult = isEditing
        ? await supabase
            .from("person")
            .select("id,name,biography,website,image_url,metadata")
            .eq("id", record.id)
            .single()
        : { data: null, error: null };

      if (cancelled) return;

      if (personResult.error) {
        toast.error(personResult.error.message);
        setLoadingRecord(false);
        return;
      }

      const person = personResult.data;
      setForm(
        person
          ? {
              name: person.name || "",
              biography: person.biography || "",
              imageUrl: person.image_url || "",
              imageSourceUrl: "",
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

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const importImage = async () => {
    const sourceUrl = form.imageSourceUrl.trim();

    if (!sourceUrl) {
      toast.error("Image URL is required");
      return;
    }

    if (!isValidGovernanceImageUrl(sourceUrl)) {
      toast.error(GOVERNANCE_IMAGE_URL_HELPER_TEXT);
      return;
    }

    if (!isEditing) {
      toast.info(
        "Save the person first, then the image will be imported automatically.",
      );
      return;
    }

    try {
      setImportingImage(true);

      const imported = await importPersonImage({
        personId: record.id,
        sourceUrl,
      });

      const updated = await updatePerson({
        p_person_id: record.id,
        p_name: form.name.trim(),
        p_biography: form.biography.trim() || null,
        p_image_url: imported.imageUrl,
        p_metadata: null,
      });

      setForm((current) => ({
        ...current,
        imageUrl: imported.imageUrl,
        imageSourceUrl: "",
      }));

      await onSaved?.(updated);
      toast.success("Image imported");
    } catch (error) {
      toast.error(error?.message || "Unable to import image");
    } finally {
      setImportingImage(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Person name is required");
      return;
    }

    try {
      setLoading(true);

      const baseParams = {
        p_name: form.name.trim(),
        p_biography: form.biography.trim() || null,
        p_image_url: form.imageUrl.trim() || null,
        p_metadata: {},
      };

      if (isEditing) {
        const updated = await updatePerson({
          ...baseParams,
          p_person_id: record.id,
          p_metadata: null,
        });

        toast.success("Person updated");
        await onSaved?.(updated);
        onOpenChange?.(false);
        return;
      }

      const created = await createPerson(baseParams);

      if (!created?.id) {
        throw new Error("Person was created but no person ID was returned.");
      }

      if (form.imageUrl) {
        const marker = "/storage/v1/object/public/governance/";
        const imageUrl = form.imageUrl.split("?")[0];
        const markerIndex = imageUrl.indexOf(marker);
        const draftPath =
          markerIndex >= 0
            ? decodeURIComponent(imageUrl.slice(markerIndex + marker.length))
            : null;

        if (draftPath?.startsWith(`person/draft-${draftId}`)) {
          const extension = draftPath.split(".").pop() || "jpg";
          const finalPath = `person/${created.id}.${extension}`;
          const publicUrl = await moveGovernanceFile(draftPath, finalPath);

          await updatePerson({
            p_person_id: created.id,
            p_name: form.name.trim(),
            p_biography: form.biography.trim() || null,
            p_image_url: publicUrl,
            p_metadata: null,
          });

          setForm((current) => ({ ...current, imageUrl: publicUrl }));
        }
      }

      if (form.imageSourceUrl.trim()) {
        if (!isValidGovernanceImageUrl(form.imageSourceUrl.trim())) {
          throw new Error(GOVERNANCE_IMAGE_URL_HELPER_TEXT);
        }

        setImportingImage(true);

        const imported = await importPersonImage({
          personId: created.id,
          sourceUrl: form.imageSourceUrl.trim(),
        });

        const updated = await updatePerson({
          p_person_id: created.id,
          p_name: form.name.trim(),
          p_biography: form.biography.trim() || null,
          p_image_url: imported.imageUrl,
          p_metadata: null,
        });

        setForm((current) => ({
          ...current,
          imageUrl: imported.imageUrl,
          imageSourceUrl: "",
        }));

        setImportingImage(false);
        toast.success("Person created with image");
        await onSaved?.(updated);
      } else {
        toast.success("Person created");
        await onSaved?.(created);
      }

      onOpenChange?.(false);
    } catch (error) {
      setImportingImage(false);
      toast.error(error?.message || "Unable to save person");
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || loadingRecord || importingImage;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-none flex-col gap-0 overflow-x-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b px-5 py-4 sm:px-6">
          <SheetTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            {isEditing ? "Edit person" : "Add person"}
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
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
                disabled={busy}
              />

              <div className="space-y-2">
                <Label htmlFor="governance-person-image-url">
                  Or import from URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="governance-person-image-url"
                    type="url"
                    value={form.imageSourceUrl}
                    onChange={(event) =>
                      setField("imageSourceUrl", event.target.value)
                    }
                    placeholder="Paste direct image URL (HTTPS)"
                    disabled={busy}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        importImage();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={importImage}
                    disabled={
                      busy ||
                      !form.imageSourceUrl.trim() ||
                      !imageSourceIsValid ||
                      !isEditing
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
                </div>

                {!isEditing && form.imageSourceUrl.trim() && (
                  <p className="text-xs text-muted-foreground">
                    The person will be created first, then the image will be
                    imported automatically.
                  </p>
                )}

                {!imageSourceIsValid && (
                  <p className="text-xs text-destructive">
                    {GOVERNANCE_IMAGE_URL_HELPER_TEXT}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="governance-person-name">Name</Label>
                <Input
                  id="governance-person-name"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="e.g. Jane Doe"
                  disabled={busy}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="governance-person-biography">Biography</Label>
                <Textarea
                  id="governance-person-biography"
                  value={form.biography}
                  onChange={(event) =>
                    setField("biography", event.target.value)
                  }
                  placeholder="Short biography or background"
                  rows={4}
                  disabled={busy}
                />
              </div>


            </div>
          )}
        </div>

        <SheetFooter className="flex-row items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={busy || loadingRecord}>
            {loading
              ? importingImage
                ? "Importing image..."
                : "Saving..."
              : isEditing
                ? "Save changes"
                : "Create person"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
