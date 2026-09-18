"use client";

import { Link2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/media/ImageUpload";
import GovernanceResources from "@/components/governance/GovernanceResources";
import { GOVERNANCE_TYPES, GOVERNANCE_STATUS_OPTIONS, formatGovernanceType } from "@/utils/governance";
import { useState } from "react";
import { useImportGovernanceOrganizationImage } from "@/hooks/governance/useImportGovernanceOrganizationImage";

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function GovernanceEntityForm({
  entity,
  draft,
  categories = [],
  attachments = [],
  links = [],
  saving = false,
  requiresValidTo = false,
  onChange,
  onCancel,
  onSave,
}) {
  const [imageSourceUrl, setImageSourceUrl] = useState("");
  const [importingImage, setImportingImage] = useState(false);
  const { importOrganizationImage } = useImportGovernanceOrganizationImage();

  if (!draft) return null;

  async function importImage() {
    const sourceUrl = imageSourceUrl.trim();
    if (!sourceUrl) return;
    try {
      setImportingImage(true);
      const imported = await importOrganizationImage({ organizationId: entity.id, sourceUrl });
      onChange("image_url", imported.imageUrl);
      setImageSourceUrl("");
    } catch (error) {
      console.error(error);
    } finally {
      setImportingImage(false);
    }
  }

  return (
    <div className="space-y-5 py-5">
      <ImageUpload bucket="governance" path={`governance/organization/${entity.id}/logo`} value={draft.image_url || null} onChange={(value) => onChange("image_url", value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving || importingImage} />
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Or import from URL</div>
        <div className="flex gap-2">
          <Input type="url" value={imageSourceUrl} onChange={(event) => setImageSourceUrl(event.target.value)} placeholder="Paste Instagram image URL" disabled={saving || importingImage} />
          <Button type="button" variant="outline" onClick={importImage} disabled={saving || importingImage || !imageSourceUrl.trim()}>{importingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}<span className="hidden sm:inline">{importingImage ? "Importing..." : "Import"}</span></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Short name">
          <Input value={draft.short_name || ""} onChange={(event) => onChange("short_name", event.target.value)} disabled={saving} />
        </Field>
        <Field label="Governance type">
          <Select value={draft.type || "government"} onValueChange={(value) => onChange("type", value)} disabled={saving}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GOVERNANCE_TYPES.map((type) => <SelectItem key={type} value={type}>{formatGovernanceType(type)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <Select value={draft.category_id || "none"} onValueChange={(value) => onChange("category_id", value === "none" ? "" : value)} disabled={saving}>
            <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="none">No category</SelectItem>
              {categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={draft.status || "active"} onValueChange={(value) => onChange("status", value)} disabled={saving}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{GOVERNANCE_STATUS_OPTIONS.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="What they do">
        <Textarea value={draft.description || ""} onChange={(event) => onChange("description", event.target.value)} rows={4} disabled={saving} />
      </Field>
      <Field label="Official website">
        <Input type="url" value={draft.website || ""} onChange={(event) => onChange("website", event.target.value)} placeholder="https://" disabled={saving} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Valid from"><Input type="date" value={draft.valid_from || ""} onChange={(event) => onChange("valid_from", event.target.value)} disabled={saving} /></Field>
        <Field label="Valid to"><Input type="date" value={draft.valid_to || ""} onChange={(event) => onChange("valid_to", event.target.value)} disabled={saving} /></Field>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">{requiresValidTo ? "Enter when this entity closed or was retired." : "Leave Valid to empty while active."}</p>
      <GovernanceResources governanceId={entity.id} attachments={attachments} links={links} canEdit={false} />

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}><X className="mr-2 h-4 w-4" />Cancel</Button>
        <Button type="button" onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </div>
    </div>
  );
}
