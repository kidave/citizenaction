import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageUpload from "@/components/media/ImageUpload";
import MenuButton from "@/components/ui/MenuButton";
import PostAttachments from "@/components/feed/post/PostAttachments";
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

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function getRelatedEntity(entity, relationships, type) {
  return relationships.find((item) => item.type === type)?.entity || null;
}

export default function GovernanceEntityModal({ open, onOpenChange, entity, parent, childEntities = [], canEdit = false, onSelect, onSaved, onDeleted, onAddChild, onAddParent, onChangeParent, categories = [], relatedGovernance = [] }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [links, setLinks] = useState([]);

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

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setDraft(null);
      setAttachments([]);
      setLinks([]);
      return;
    }
    if (entity) {
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
      loadResources(entity.id).catch((error) => toast.error(error?.message || "Unable to load governance resources"));
    }
  }, [open, entity]);

  const relationships = useMemo(() => {
    const items = [];
    const metadata = entity?.metadata && typeof entity.metadata === "object" ? entity.metadata : {};
    const roleId = entity?.role_entity_id || metadata.role_entity_id || metadata.position_entity_id || null;
    const headId = entity?.head_person_id || metadata.head_person_id || metadata.current_head_person_id || null;
    if (roleId) {
      const role = relatedGovernance.find((item) => item.id === roleId);
      if (role) items.push({ type: "role", entity: role });
    }
    if (headId) {
      const head = relatedGovernance.find((item) => item.id === headId);
      if (head) items.push({ type: "head", entity: head });
    }
    return items;
  }, [entity, relatedGovernance]);

  if (!entity) return null;

  const label = getGovernanceLabel(entity);
  const role = getRelatedEntity(entity, relationships, "role");
  const head = getRelatedEntity(entity, relationships, "head");
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

  const renderRelatedLink = (title, related) => {
    if (!related) return null;
    return (
      <button type="button" onClick={() => onSelect?.(related)} className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-muted">
        <Avatar className="h-7 w-7 shrink-0 rounded-md">
          <AvatarImage src={related.image_url || undefined} alt="" />
          <AvatarFallback className="rounded-md text-[10px]">{getInitials(getGovernanceLabel(related))}</AvatarFallback>
        </Avatar>
        <span className="min-w-0"><span className="block text-[11px] text-muted-foreground">{title}</span><span className="block truncate text-sm font-medium">{getGovernanceLabel(related)}</span></span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <div className="flex items-start gap-3 pr-8">
          <Avatar className="h-12 w-12 rounded-xl"><AvatarImage src={(editing ? draft?.image_url : entity.image_url) || undefined} alt="" /><AvatarFallback className="rounded-xl">{getInitials(label)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            {editing ? <Input autoFocus value={draft?.name || ""} onChange={(event) => updateDraft("name", event.target.value)} className="text-lg font-semibold" /> : <><h2 className="truncate text-xl font-semibold" title={label}>{label}</h2><p className="mt-1 text-sm text-muted-foreground">{formatType(entity)}</p></>}
          </div>
          {canEdit && !editing && <MenuButton onEdit={() => setEditing(true)} onDelete={handleDelete} deleteTitle={`Delete ${label}?`} deleteDescription={childEntities.length ? `${label} has ${childEntities.length} child ${childEntities.length === 1 ? "entity" : "entities"}. Move those children before deleting it.` : "This permanently removes the governance entity and its hierarchy record."} />}
        </div>

        {editing ? (
          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Short name"><Input value={draft?.short_name || ""} onChange={(event) => updateDraft("short_name", event.target.value)} placeholder="Optional" /></Field><Field label="Entity type"><Select value={draft?.entity_type || "authority"} onValueChange={(value) => updateDraft("entity_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ENTITY_TYPES.map((type) => <SelectItem key={type} value={type}>{formatType({ entity_type: type })}</SelectItem>)}</SelectContent></Select></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><Select value={draft?.category_id || "none"} onValueChange={(value) => updateDraft("category_id", value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No category</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field><Field label="Status"><Select value={currentStatus} onValueChange={(value) => updateDraft("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></Field></div>
            <Field label="Description"><Textarea value={draft?.description || ""} onChange={(event) => updateDraft("description", event.target.value)} rows={4} placeholder="What does this organisation do?" /></Field>
            <Field label="Official website"><Input type="url" value={draft?.website || ""} onChange={(event) => updateDraft("website", event.target.value)} placeholder="https://" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={draft?.valid_from || ""} onChange={(event) => updateDraft("valid_from", event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={draft?.valid_to || ""} onChange={(event) => updateDraft("valid_to", event.target.value)} disabled={!requiresValidTo} /></Field></div>
            <p className="-mt-3 text-xs text-muted-foreground">{requiresValidTo ? "Add the date this entity closed or was retired." : "Valid to stays empty while this entity is active."}</p>
            <ImageUpload bucket="governance" path={`governance/${entity.id}/logo`} value={draft?.image_url || null} onChange={(value) => updateDraft("image_url", value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setEditing(false); setDraft(null); }} disabled={saving}><X className="mr-2 h-4 w-4" />Cancel</Button><Button type="button" onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save changes"}</Button></div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Short name</p><p className="mt-1 truncate text-sm font-medium" title={entity.short_name || "—"}>{entity.short_name || "—"}</p></div>
              <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{role ? "Role" : "Entity type"}</p>{role ? <button type="button" onClick={() => onSelect?.(role)} className="mt-1 block max-w-full truncate text-left text-sm font-medium hover:underline" title={getGovernanceLabel(role)}>{getGovernanceLabel(role)}</button> : <p className="mt-1 truncate text-sm font-medium" title={formatType(entity)}>{formatType(entity)}</p>}</div>
              <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Head</p>{head ? <button type="button" onClick={() => onSelect?.(head)} className="mt-1 block max-w-full truncate text-left text-sm font-medium hover:underline" title={getGovernanceLabel(head)}>{getGovernanceLabel(head)}</button> : <p className="mt-1 text-sm text-muted-foreground">—</p>}</div>
              <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Valid from</p><p className="mt-1 text-sm font-medium">{entity.valid_from ? new Date(entity.valid_from).toLocaleDateString() : "—"}</p></div>
            </div>

            {(parent || childEntities.length) && <section className="grid gap-3 sm:grid-cols-2">{parent && <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Parent</p><button type="button" onClick={() => onSelect?.(parent)} className="mt-1 flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left hover:bg-muted"><Avatar className="h-7 w-7 rounded-md"><AvatarImage src={parent.image_url || undefined} alt="" /><AvatarFallback className="rounded-md text-[10px]">{getInitials(getGovernanceLabel(parent))}</AvatarFallback></Avatar><span className="min-w-0 truncate text-sm font-medium">{getGovernanceLabel(parent)}</span></button></div>}{childEntities.length > 0 && <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Children</p><div className="mt-1 flex flex-wrap gap-1">{childEntities.slice(0, 4).map((child) => <button type="button" key={child.id} onClick={() => onSelect?.(child)} className="flex items-center gap-1.5 rounded-md px-1 py-1.5 text-left hover:bg-muted"><Avatar className="h-7 w-7 rounded-md"><AvatarImage src={child.image_url || undefined} alt="" /><AvatarFallback className="rounded-md text-[10px]">{getInitials(getGovernanceLabel(child))}</AvatarFallback></Avatar><span className="max-w-28 truncate text-sm font-medium">{getGovernanceLabel(child)}</span></button>)}</div></div>}</section>}

            {entity.description && <section><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What they do</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{entity.description}</p></section>}
            {(role || head) && <section><div className="grid gap-2 sm:grid-cols-2">{renderRelatedLink("Role", role)}{renderRelatedLink("Head", head)}</div></section>}
            {(attachments.length > 0 || links.length > 0) && <section><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Documents & links</p></div><div className="mt-2"><PostAttachments attachments={attachments} links={links} /></div></section>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
