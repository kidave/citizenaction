import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageUpload from "@/components/media/ImageUpload";
import MenuButton from "@/components/ui/MenuButton";
import GovernanceResources from "@/components/governance/GovernanceResources";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceLabel } from "@/utils/governance";

const ENTITY_TYPES = ["authority", "unit", "position", "person", "organisation", "committee", "programme", "project", "ministry", "department", "division", "office", "ward", "station", "zone"];
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

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function toIsoStart(value) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null;
}

function toIsoEnd(value) {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : null;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function RelationCard({ label, entity, onSelect }) {
  if (!entity) return null;
  return (
    <button type="button" onClick={() => onSelect?.(entity)} className="min-w-0 rounded-lg border bg-muted/30 p-3 text-left transition-colors hover:bg-muted">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex min-w-0 items-center gap-2">
        <Avatar className="h-7 w-7 shrink-0 rounded-md"><AvatarImage src={entity.image_url || undefined} alt="" /><AvatarFallback className="rounded-md text-[10px]">{getInitials(entity.name || entity.short_name)}</AvatarFallback></Avatar>
        <span className="min-w-0 truncate text-sm font-medium" title={entity.name}>{entity.name}</span>
      </div>
    </button>
  );
}

export default function GovernanceEntityModal({ open, onOpenChange, entity, parent, childEntities = [], canEdit = false, onSelect, onSaved, onDeleted, onAddChild, onAddParent, onChangeParent, categories = [] }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [links, setLinks] = useState([]);
  const [roleEntity, setRoleEntity] = useState(null);
  const [headPerson, setHeadPerson] = useState(null);

  const loadResources = async (governanceId) => {
    const [{ data: attachmentData, error: attachmentError }, { data: linkData, error: linkError }] = await Promise.all([
      supabase.from("attachment").select("*").eq("governance_id", governanceId).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("link").select("*").eq("governance_id", governanceId).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
    ]);
    if (attachmentError) throw attachmentError;
    if (linkError) throw linkError;
    setAttachments(attachmentData || []);
    setLinks(linkData || []);
  };

  const loadRelations = async (governanceId) => {
    const { data, error } = await supabase.from("governance").select("metadata").eq("id", governanceId).maybeSingle();
    if (error) throw error;

    const metadata = data?.metadata && typeof data.metadata === "object" ? data.metadata : {};
    const roleId = governanceId && (metadata.role_entity_id || metadata.position_entity_id || metadata.role_id);
    const headId = governanceId && (metadata.head_person_id || metadata.current_head_person_id || metadata.head_id);
    const ids = [roleId, headId].filter(Boolean);

    if (!ids.length) {
      setRoleEntity(null);
      setHeadPerson(null);
      return;
    }

    const { data: related, error: relatedError } = await supabase.from("governance").select("id,name,short_name,entity_type,image_url,status").in("id", ids);
    if (relatedError) throw relatedError;

    const byId = new Map((related || []).map((item) => [item.id, item]));
    setRoleEntity(roleId ? byId.get(roleId) || null : null);
    setHeadPerson(headId ? byId.get(headId) || null : null);
  };

  const loadDetails = async (governanceId) => {
    await Promise.all([loadResources(governanceId), loadRelations(governanceId)]);
  };

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setDraft(null);
      setAttachments([]);
      setLinks([]);
      setRoleEntity(null);
      setHeadPerson(null);
      return;
    }
    if (!entity) return;

    setEditing(false);
    setDraft({
      name: entity.name || "",
      short_name: entity.short_name || "",
      description: entity.description || "",
      website: entity.website || "",
      entity_type: entity.entity_type || "authority",
      status: entity.status || "active",
      valid_from: toDateInput(entity.valid_from),
      valid_to: toDateInput(entity.valid_to),
      image_url: entity.image_url || null,
      category_id: entity.category_id || "",
    });

    loadDetails(entity.id).catch((error) => toast.error(error?.message || "Unable to load governance details"));
  }, [open, entity]);

  if (!entity) return null;

  const label = entity.name || getGovernanceLabel(entity);
  const currentStatus = draft?.status || entity.status || "active";
  const requiresValidTo = currentStatus === "inactive" || currentStatus === "deprecated";
  const categoryName = categories.find((item) => item.id === entity.category_id)?.name || entity.category_name || null;
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!draft?.name?.trim()) return toast.error("Name is required");
    if (draft.valid_to && draft.valid_from && draft.valid_to < draft.valid_from) return toast.error("Valid to cannot be earlier than valid from");
    if (requiresValidTo && !draft.valid_to) return toast.error("Add the date this entity became inactive");

    setSaving(true);
    const { data, error } = await supabase.from("governance").update({
      name: draft.name.trim(),
      short_name: draft.short_name.trim() || null,
      description: draft.description.trim() || null,
      website: draft.website.trim() || null,
      entity_type: draft.entity_type,
      status: currentStatus,
      valid_from: toIsoStart(draft.valid_from),
      valid_to: requiresValidTo ? toIsoEnd(draft.valid_to) : null,
      image_url: draft.image_url || null,
      category_id: draft.category_id || null,
    }).eq("id", entity.id).select("*").single();

    if (error) {
      toast.error(error.message || "Unable to save governance entity");
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
    setDraft(null);
    onSaved?.(data);
    toast.success("Governance entity updated");
  };

  const handleDelete = async () => {
    if (childEntities.length > 0) {
      toast.error("Move or delete the child entities before deleting this entity.");
      return;
    }

    const { error } = await supabase.rpc("delete_governance_entity", { p_entity_id: entity.id });
    if (error) {
      toast.error(error.message || "Unable to delete governance entity");
      return;
    }

    toast.success("Governance entity deleted");
    onDeleted?.(entity);
    onOpenChange?.(false);
  };

  const reloadResources = () => loadResources(entity.id).catch((error) => toast.error(error?.message || "Unable to refresh resources"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <div className="flex items-start gap-3 pr-8">
          <Avatar className="h-12 w-12 shrink-0 rounded-xl">
            <AvatarImage src={(editing ? draft?.image_url : entity.image_url) || undefined} alt="" />
            <AvatarFallback className="rounded-xl">{getInitials(label)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {editing ? (
              <Input autoFocus value={draft?.name || ""} onChange={(event) => updateDraft("name", event.target.value)} className="text-lg font-semibold" />
            ) : (
              <h2 className="truncate text-xl font-semibold" title={label}>{label}</h2>
            )}
          </div>

          {canEdit && !editing && (
            <MenuButton
              onEdit={() => setEditing(true)}
              onAddParent={() => onAddParent?.(entity)}
              onAddChild={() => onAddChild?.(entity)}
              onChangeParent={() => onChangeParent?.(entity)}
              onDelete={handleDelete}
              deleteTitle={`Delete ${label}?`}
              deleteDescription={childEntities.length ? `${label} has ${childEntities.length} child ${childEntities.length === 1 ? "entity" : "entities"}. Move those children before deleting it.` : "This permanently removes the governance entity and its hierarchy record."}
            />
          )}
        </div>

        {editing ? (
          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Short name"><Input value={draft?.short_name || ""} onChange={(event) => updateDraft("short_name", event.target.value)} placeholder="Optional" /></Field>
              <Field label="Entity type"><Select value={draft?.entity_type || "authority"} onValueChange={(value) => updateDraft("entity_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ENTITY_TYPES.map((type) => <SelectItem key={type} value={type}>{formatType({ entity_type: type })}</SelectItem>)}</SelectContent></Select></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category"><Select value={draft?.category_id || "none"} onValueChange={(value) => updateDraft("category_id", value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No category</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Status"><Select value={currentStatus} onValueChange={(value) => updateDraft("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></Field>
            </div>
            <Field label="Description"><Textarea value={draft?.description || ""} onChange={(event) => updateDraft("description", event.target.value)} rows={4} placeholder="What does this organisation do?" /></Field>
            <Field label="Official website"><Input type="url" value={draft?.website || ""} onChange={(event) => updateDraft("website", event.target.value)} placeholder="https://" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={draft?.valid_from || ""} onChange={(event) => updateDraft("valid_from", event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={draft?.valid_to || ""} onChange={(event) => updateDraft("valid_to", event.target.value)} disabled={!requiresValidTo} /></Field></div>
            <p className="-mt-3 text-xs text-muted-foreground">{requiresValidTo ? "Add the date this entity closed or was retired." : "Valid to stays empty while this entity is active."}</p>
            <ImageUpload bucket="governance" path={`governance/${entity.id}/logo`} value={draft?.image_url || null} onChange={(value) => updateDraft("image_url", value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
            <GovernanceResources governanceId={entity.id} attachments={attachments} links={links} canEdit onChanged={reloadResources} />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setEditing(false); setDraft(null); }} disabled={saving}><X className="mr-2 h-4 w-4" />Cancel</Button><Button type="button" onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save changes"}</Button></div>
          </div>
        ) : (
          <div className="space-y-5">
            {(categoryName || entity.valid_from || entity.valid_to || roleEntity || headPerson) && (
              <div className="grid grid-cols-2 gap-2">
                {categoryName && <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Category</p><p className="mt-1 truncate text-sm font-medium" title={categoryName}>{categoryName}</p></div>}
                {(entity.valid_from || entity.valid_to) && <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{entity.valid_to ? "Founded / ended" : "Founded"}</p><p className="mt-1 truncate text-sm font-medium" title={`${formatDate(entity.valid_from)}${entity.valid_to ? ` – ${formatDate(entity.valid_to)}` : ""}`}>{formatDate(entity.valid_from)}{entity.valid_to ? ` – ${formatDate(entity.valid_to)}` : ""}</p></div>}
                <RelationCard label="Role" entity={roleEntity} onSelect={onSelect} />
                <RelationCard label="Head" entity={headPerson} onSelect={onSelect} />
              </div>
            )}

            {entity.description && <section><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What they do</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{entity.description}</p></section>}

            {(parent || childEntities.length > 0) && <section className="grid gap-3 sm:grid-cols-2">{parent && <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Parent</p><button type="button" onClick={() => onSelect?.(parent)} className="mt-2 flex w-full min-w-0 items-center gap-2 rounded-lg border p-3 text-left hover:bg-accent"><Avatar className="h-7 w-7 shrink-0 rounded-md"><AvatarImage src={parent.image_url || undefined} alt="" /><AvatarFallback className="rounded-md text-[10px]">{getInitials(parent.name)}</AvatarFallback></Avatar><span className="min-w-0 truncate text-sm font-medium" title={parent.name}>{parent.name}</span></button></div>}{childEntities.length > 0 && <div><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Children</p><span className="text-xs text-muted-foreground">{childEntities.length}</span></div><div className="mt-1 max-h-36 space-y-0.5 overflow-y-auto">{childEntities.map((child) => <button type="button" key={child.id} onClick={() => onSelect?.(child)} className="flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-1.5 text-left hover:bg-muted"><Avatar className="h-7 w-7 shrink-0 rounded-md"><AvatarImage src={child.image_url || undefined} alt="" /><AvatarFallback className="rounded-md text-[10px]">{getInitials(child.name)}</AvatarFallback></Avatar><span className="min-w-0 truncate text-sm font-medium" title={child.name}>{child.name}</span></button>)}</div></div>}</section>}

            <GovernanceResources governanceId={entity.id} attachments={attachments} links={links} canEdit={false} />

            {entity.website && <a href={entity.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium hover:underline">Official website</a>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
