import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/media/ImageUpload";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getGovernanceLabel } from "@/utils/governance";

const ENTITY_TYPES = [
  "authority", "unit", "position", "person", "organisation", "committee", "programme", "project",
  "ministry", "department", "division", "office", "ward", "station",
];
const STATUS_OPTIONS = [["active", "Active"], ["inactive", "Inactive"], ["deprecated", "Deprecated"]];

function formatType(entity) {
  const type = entity?.unit_type && entity.unit_type !== "authority" ? entity.unit_type : entity?.entity_type;
  if (!type) return "Governance";
  if (type === "other") return "Organisation";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
function getInitials(value) {
  return value?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";
}
function toDateInput(value) { return value ? new Date(value).toISOString().slice(0, 10) : ""; }
function toIsoStart(value) { return value ? new Date(`${value}T00:00:00`).toISOString() : null; }
function toIsoEnd(value) { return value ? new Date(`${value}T23:59:59.999`).toISOString() : null; }
function Field({ label, children }) { return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>; }

export default function GovernanceEntityModal({
  open,
  onOpenChange,
  entity,
  parent,
  childEntities = [],
  canEdit = false,
  onSelect,
  onSaved,
  onAddChild,
  onAddParent,
  onChangeParent,
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setDraft(null);
      return;
    }
    if (entity) {
      setEditing(false);
      setDraft({
        name: entity.name || "", short_name: entity.short_name || "", description: entity.description || "",
        website: entity.website || "", entity_type: entity.entity_type || "authority", status: entity.status || "active",
        valid_from: toDateInput(entity.valid_from), valid_to: toDateInput(entity.valid_to), image_url: entity.image_url || null,
      });
    }
  }, [open, entity]);

  if (!entity) return null;
  const label = getGovernanceLabel(entity);
  const currentStatus = draft?.status || entity.status || "active";
  const requiresValidTo = currentStatus === "inactive" || currentStatus === "deprecated";
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!draft?.name?.trim()) return toast.error("Name is required");
    if (draft.valid_to && draft.valid_from && draft.valid_to < draft.valid_from) return toast.error("Valid to cannot be earlier than valid from");
    if (requiresValidTo && !draft.valid_to) return toast.error("Add the date this entity became inactive");
    setSaving(true);
    const { data, error } = await supabase.from("governance").update({
      name: draft.name.trim(), short_name: draft.short_name.trim() || null, description: draft.description.trim() || null,
      website: draft.website.trim() || null, entity_type: draft.entity_type, status: currentStatus,
      valid_from: toIsoStart(draft.valid_from), valid_to: toIsoEnd(draft.valid_to), image_url: draft.image_url || null,
      ...(user?.id ? { updated_by: user.id } : {}),
    }).eq("id", entity.id).select("*").single();
    if (error) { toast.error(error.message || "Unable to save governance entity"); setSaving(false); return; }
    setSaving(false); setEditing(false); setDraft(null); onSaved?.(data); toast.success("Governance entity updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <div className="flex items-start gap-3 pr-8">
          <Avatar className="h-12 w-12 rounded-xl"><AvatarImage src={(editing ? draft?.image_url : entity.image_url) || undefined} alt="" /><AvatarFallback className="rounded-xl">{getInitials(label)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">{editing ? <Input autoFocus value={draft?.name || ""} onChange={(event) => updateDraft("name", event.target.value)} className="text-lg font-semibold" /> : <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold">{label}</h2><Badge variant="outline">{formatType(entity)}</Badge>{currentStatus !== "active" && <Badge variant="secondary">{currentStatus}</Badge>}</div>}</div>
          {canEdit && !editing && <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</Button>}
        </div>

        {editing ? (
          <div className="space-y-5 py-2">
            <Field label="Entity type"><Select value={draft?.entity_type || "authority"} onValueChange={(value) => updateDraft("entity_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ENTITY_TYPES.map((type) => <SelectItem key={type} value={type}>{formatType({ entity_type: type })}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Short name"><Input value={draft?.short_name || ""} onChange={(event) => updateDraft("short_name", event.target.value)} placeholder="Optional" /></Field>
            <Field label="Description"><Textarea value={draft?.description || ""} onChange={(event) => updateDraft("description", event.target.value)} rows={4} placeholder="Optional" /></Field>
            <Field label="Official website"><Input type="url" value={draft?.website || ""} onChange={(event) => updateDraft("website", event.target.value)} placeholder="https://" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={draft?.valid_from || ""} onChange={(event) => updateDraft("valid_from", event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={draft?.valid_to || ""} onChange={(event) => updateDraft("valid_to", event.target.value)} disabled={!requiresValidTo} /></Field></div>
            <Field label="Status"><Select value={currentStatus} onValueChange={(value) => updateDraft("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></Field>
            <p className="-mt-3 text-xs text-muted-foreground">{requiresValidTo ? "Add Valid to for the date this entity closed or was retired." : "Leave Valid to empty while this entity remains active."}</p>
            <ImageUpload bucket="governance" path={`governance/${entity.id}/logo`} value={draft?.image_url || null} onChange={(value) => updateDraft("image_url", value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setEditing(false); setDraft(null); }} disabled={saving}><X className="mr-2 h-4 w-4" />Cancel</Button><Button type="button" onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save changes"}</Button></div>
          </div>
        ) : (
          <div className="space-y-5">
            {(parent || canEdit) && <section><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Parent</p>{canEdit && <Button type="button" variant="ghost" size="sm" onClick={() => onChangeParent?.(entity)}>Change</Button>}</div>{parent ? <button type="button" onClick={() => onSelect?.(parent)} className="mt-2 w-full rounded-lg border p-3 text-left hover:bg-accent"><span className="block truncate text-sm font-medium">{getGovernanceLabel(parent)}</span><span className="text-xs text-muted-foreground">{formatType(parent)}</span></button> : <p className="mt-2 text-sm text-muted-foreground">No parent recorded.</p>}</section>}
            {canEdit && <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => onAddParent?.(entity)}><Plus className="mr-2 h-4 w-4" />Add parent</Button><Button type="button" variant="outline" size="sm" onClick={() => onAddChild?.(entity)}><Plus className="mr-2 h-4 w-4" />Add child</Button></div>}
            {entity.description && <section><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">About</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{entity.description}</p></section>}
            <section><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Children</p><span className="text-xs text-muted-foreground">{childEntities.length}</span></div>{childEntities.length ? <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">{childEntities.map((child) => <button type="button" key={child.id} onClick={() => onSelect?.(child)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted"><span className="min-w-0 truncate text-sm font-medium">{getGovernanceLabel(child)}</span><span className="ml-3 shrink-0 text-xs text-muted-foreground">{formatType(child)}</span></button>)}</div> : <p className="mt-2 text-sm text-muted-foreground">No child entities recorded yet.</p>}</section>
            {entity.website && <a href={entity.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium hover:underline">Official website <ExternalLink className="ml-1.5 h-3.5 w-3.5" /></a>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
