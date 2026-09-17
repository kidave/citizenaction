"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/media/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { GOVERNANCE_STATUS_OPTIONS, GOVERNANCE_TYPES, formatGovernanceType, governanceRequiresValidTo } from "@/utils/governance";

function emptyForm() {
  return {
    name: "",
    shortName: "",
    type: "organization",
    categoryId: "",
    status: "active",
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: "",
    imageUrl: "",
  };
}

export default function GovernanceOrganizationCreateDialog({
  open,
  onOpenChange,
  categories = [],
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm());
    setSaving(false);
  }, [open]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const requiresValidTo = governanceRequiresValidTo(form.status);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.type) return toast.error("Governance type is required");
    if (!form.validFrom) return toast.error("Valid from is required");
    if (requiresValidTo && !form.validTo) return toast.error("Add Valid to when the entity becomes inactive or deprecated");
    if (form.validTo && form.validTo < form.validFrom) return toast.error("Valid to cannot be earlier than valid from");

    try {
      setSaving(true);
      const result = await supabase.rpc("create_governance_entity", {
        p_name: form.name.trim(),
        p_type: form.type,
        p_short_name: form.shortName.trim() || null,
        p_status: form.status,
        p_valid_from: `${form.validFrom}T00:00:00Z`,
        p_valid_to: form.validTo ? `${form.validTo}T23:59:59.999Z` : null,
        p_category_id: form.categoryId || null,
        p_image_url: form.imageUrl || null,
      });
      if (result.error) throw result.error;

      const created = Array.isArray(result.data) ? result.data[0] : result.data;
      toast.success("Governance organization created");
      await onSaved?.(created);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to create governance organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Add organization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ImageUpload
            bucket="governance"
            path="governance/organization/draft/logo"
            value={form.imageUrl || null}
            onChange={(value) => setField("imageUrl", value || "")}
            label="Organization logo"
            helperText="PNG, JPG or WebP · up to 5 MB"
            disabled={saving}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="governance-organization-name">Name</Label>
              <Input
                id="governance-organization-name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="e.g. Mumbai Metropolitan Region Development Authority"
                disabled={saving}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="governance-organization-short-name">Short name</Label>
              <Input
                id="governance-organization-short-name"
                value={form.shortName}
                onChange={(event) => setField("shortName", event.target.value)}
                placeholder="e.g. MMRDA"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => setField("type", value)} disabled={saving}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {GOVERNANCE_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>{formatGovernanceType(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId || "none"} onValueChange={(value) => setField("categoryId", value === "none" ? "" : value)} disabled={saving}>
                <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setField("status", value)} disabled={saving}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOVERNANCE_STATUS_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valid from</Label>
              <Input type="date" value={form.validFrom} onChange={(event) => setField("validFrom", event.target.value)} disabled={saving} />
            </div>

            <div className="space-y-2">
              <Label>Valid to</Label>
              <Input type="date" value={form.validTo} onChange={(event) => setField("validTo", event.target.value)} disabled={saving} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button>
          <Button type="button" onClick={save} disabled={saving}>{saving ? "Creating..." : "Create organization"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
