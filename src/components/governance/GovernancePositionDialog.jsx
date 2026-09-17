"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { supabase } from "@/lib/supabase/client";

function emptyForm() {
  return {
    name: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    organizationId: "",
  };
}

export default function GovernancePositionDialog({
  open,
  onOpenChange,
  record = null,
  defaultOrganizationId = null,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const isEditing = !!record?.id;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setLoadingRecord(isEditing);

      const [organizationResult, categoryResult, positionResult] = await Promise.all([
        supabase
          .from("governance")
          .select("id,name,short_name,slug,type,status")
          .neq("status", "deleted")
          .order("name")
          .limit(500),
        supabase.from("category").select("id,name,slug").order("sort_order").order("name").limit(500),
        isEditing
          ? supabase
              .from("position")
              .select("id,name,description,image_url,category_id,appointing_organization_id,metadata")
              .eq("id", record.id)
              .single()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (cancelled) return;

      if (organizationResult.error) {
        toast.error(organizationResult.error.message);
        setLoadingRecord(false);
        return;
      }
      if (categoryResult.error) {
        toast.error(categoryResult.error.message);
        setLoadingRecord(false);
        return;
      }
      if (positionResult.error) {
        toast.error(positionResult.error.message);
        setLoadingRecord(false);
        return;
      }

      const position = positionResult.data;
      setOrganizations(organizationResult.data || []);
      setCategories(categoryResult.data || []);
      setForm(
        position
          ? {
              name: position.name || "",
              description: position.description || "",
              imageUrl: position.image_url || "",
              categoryId: position.category_id || "",
              organizationId: position.appointing_organization_id || "",
            }
          : {
              ...emptyForm(),
              organizationId: defaultOrganizationId || "",
            },
      );
      setLoadingRecord(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, record?.id, defaultOrganizationId, isEditing]);

  const organizationOptions = useMemo(
    () =>
      organizations.map((item) => ({
        value: item.id,
        label: item.name,
        searchValue: `${item.name || ""} ${item.short_name || ""}`,
      })),
    [organizations],
  );

  const categoryOptions = useMemo(
    () => [
      { value: "none", label: "No category", searchValue: "no category" },
      ...categories.map((item) => ({
        value: item.id,
        label: item.name,
        searchValue: `${item.name || ""} ${item.slug || ""}`,
      })),
    ],
    [categories],
  );

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Position name is required");
      return;
    }

    try {
      setLoading(true);
      const rpc = isEditing ? "update_position" : "create_position";
      const params = isEditing
        ? {
            p_position_id: record.id,
            p_name: form.name.trim(),
            p_description: form.description.trim() || null,
            p_image_url: form.imageUrl.trim() || null,
            p_category_id: form.categoryId === "none" ? null : form.categoryId || null,
            p_appointing_organization_id: form.organizationId || null,
            p_metadata: null,
          }
        : {
            p_name: form.name.trim(),
            p_description: form.description.trim() || null,
            p_image_url: form.imageUrl.trim() || null,
            p_category_id: form.categoryId === "none" ? null : form.categoryId || null,
            p_metadata: {},
            p_appointing_organization_id: form.organizationId || null,
          };

      const result = await supabase.rpc(rpc, params);
      if (result.error) throw result.error;

      toast.success(isEditing ? "Position updated" : "Position created");
      await onSaved?.(result.data);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save position");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            {isEditing ? "Edit position" : "Add position"}
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
            <div className="space-y-2">
              <Label htmlFor="governance-position-name">Name</Label>
              <Input
                id="governance-position-name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="e.g. Commissioner"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Appointing organization</Label>
              <SearchableSelect
                value={form.organizationId}
                onValueChange={(value) => setField("organizationId", value)}
                options={organizationOptions}
                placeholder="No organization"
                searchPlaceholder="Search organizations..."
                emptyText="No organizations found."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <SearchableSelect
                value={form.categoryId || "none"}
                onValueChange={(value) => setField("categoryId", value)}
                options={categoryOptions}
                placeholder="No category"
                searchPlaceholder="Search categories..."
                emptyText="No categories found."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="governance-position-description">Description</Label>
              <Textarea
                id="governance-position-description"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="What does this position do?"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="governance-position-image">Image URL</Label>
              <Input
                id="governance-position-image"
                type="url"
                value={form.imageUrl}
                onChange={(event) => setField("imageUrl", event.target.value)}
                placeholder="https://..."
                disabled={loading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={loading || loadingRecord}>
            {loading ? "Saving..." : isEditing ? "Save changes" : "Create position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
