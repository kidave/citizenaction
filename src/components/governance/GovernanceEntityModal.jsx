import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Save, Trash2, X } from "lucide-react";
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
import { GOVERNANCE_ENTITY_TYPES, GOVERNANCE_STATUS_OPTIONS, formatGovernanceType, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function RelationItem({ entity, onSelect }) {
  if (!entity) return null;
  return <button type="button" onClick={() => onSelect?.(entity)} className="flex min-w-0 items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-muted/60">
    <Avatar className="h-8 w-8 shrink-0 rounded-md"><AvatarImage src={entity.image_url || undefined} alt="" /><AvatarFallback className="rounded-md text-[10px]">{getGovernanceInitials(entity.name)}</AvatarFallback></Avatar>
    <span className="min-w-0 truncate text-sm font-medium" title={entity.name}>{entity.name}</span>
  </button>;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function GovernanceEntityModal({ open, onOpenChange, entity, parent, childEntities = [], canEdit = false, onSelect, onSaved, onDeleted, onAddChild, onAddParent, onChangeParent, categories = [] }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [links, setLinks] = useState([]);
  const [leadership, setLeadership] = useState([]);
  const [leadershipLoading, setLeadershipLoading] = useState(false);
  const [leadershipSaving, setLeadershipSaving] = useState(false);
  const [newLeader, setNewLeader] = useState({ id: null, person_name: "", position_name: "Head", started_at: "", ended_at: "", is_vacant: false, notes: "" });

  const categoryName = categories.find((item) => item.id === entity?.category_id)?.name || entity?.category_name || null;
  const jurisdiction = entity?.jurisdiction || entity?.location_name || entity?.location_label || entity?.address || null;

  const sortedLeadership = useMemo(() => [...leadership].sort((a, b) => new Date(b.started_at) - new Date(a.started_at)), [leadership]);
  const currentLeader = sortedLeadership.find((item) => !item.ended_at || new Date(item.ended_at) >= new Date()) || null;

  const loadLeadership = async () => {
    if (!entity?.id) return;
    setLeadershipLoading(true);
    const { data, error } = await supabase.from("governance_leadership").select("id,governance_id,person_name,person_governance_id,position_name,started_at,ended_at,is_vacant,notes").eq("governance_id", entity.id).order("started_at", { ascending: false });
    setLeadershipLoading(false);
    if (error) throw error;
    setLeadership(data || []);
  };

  useEffect(() => {
    if (!open || !entity) {
      if (!open) {
        setEditing(false); setDraft(null); setAttachments([]); setLinks([]); setLeadership([]);
        setNewLeader({ id: null, person_name: "", position_name: "Head", started_at: "", ended_at: "", is_vacant: false, notes: "" });
      }
      return;
    }

    setEditing(false);
    setDraft({
      name: entity.name || "",
      short_name: entity.short_name || "",
      description: entity.description || "",
      website: entity.website || "",
      entity_type: entity.entity_type || "authority",
      status: entity.status || "active",
      valid_from: entity.valid_from ? new Date(entity.valid_from).toISOString().slice(0, 10) : "",
      valid_to: entity.valid_to ? new Date(entity.valid_to).toISOString().slice(0, 10) : "",
      image_url: entity.image_url || null,
      category_id: entity.category_id || "",
    });

    const loadRelationsAndResources = async () => {
      const [{ data: attachmentData, error: attachmentError }, { data: linkData, error: linkError }, { error: leadershipError }] = await Promise.all([
        supabase.from("attachment").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("link").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        loadLeadership().catch((error) => ({ error })),
      ]);
      if (attachmentError) throw attachmentError;
      if (linkError) throw linkError;
      if (leadershipError) throw leadershipError;
      setAttachments(attachmentData || []);
      setLinks(linkData || []);
    };

    loadRelationsAndResources().catch((error) => toast.error(error?.message || "Unable to load governance details"));
  }, [open, entity]);

  if (!entity) return null;

  const label = getGovernanceLabel(entity);
  const currentStatus = draft?.status || entity.status || "active";
  const requiresValidTo = currentStatus === "inactive" || currentStatus === "deprecated";
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!draft?.name?.trim()) return toast.error("Name is required");
    if (!draft.valid_from) return toast.error("Valid from is required");
    if (draft.valid_to && draft.valid_from && draft.valid_to < draft.valid_from) return toast.error("Valid to cannot be earlier than Valid from");
    if (requiresValidTo && !draft.valid_to) return toast.error("Add the date this entity became inactive");
    try {
      setSaving(true);
      const { data, error } = await supabase.rpc("update_governance_entity", {
        p_entity_id: entity.id,
        p_name: draft.name.trim(),
        p_short_name: draft.short_name.trim() || null,
        p_description: draft.description.trim() || null,
        p_website: draft.website.trim() || null,
        p_entity_type: draft.entity_type,
        p_status: currentStatus,
        p_valid_from: `${draft.valid_from}T00:00:00Z`,
        p_valid_to: requiresValidTo ? `${draft.valid_to}T23:59:59.999Z` : null,
        p_image_url: draft.image_url || null,
        p_category_id: draft.category_id || null,
      });
      if (error) throw error;
      setEditing(false); setDraft(null); onSaved?.(data); toast.success("Governance entity updated");
    } catch (error) { toast.error(error?.message || "Unable to save governance entity"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (childEntities.length > 0) return toast.error("Move the child entities before deleting this entity.");
    const { error } = await supabase.rpc("delete_governance_entity", { p_entity_id: entity.id });
    if (error) return toast.error(error.message || "Unable to delete governance entity");
    toast.success("Governance entity deleted");
    onDeleted?.(entity);
    onOpenChange?.(false);
  };

  const saveLeadership = async () => {
    if (!newLeader.started_at) return toast.error("Start date is required");
    if (!newLeader.is_vacant && !newLeader.person_name.trim()) return toast.error("Leader name is required unless vacant");
    if (newLeader.ended_at && newLeader.ended_at < newLeader.started_at) return toast.error("End date cannot be earlier than start date");
    try {
      setLeadershipSaving(true);
      const { error } = await supabase.rpc("upsert_governance_leadership", {
        p_id: newLeader.id,
        p_governance_id: entity.id,
        p_person_name: newLeader.person_name.trim() || null,
        p_person_governance_id: null,
        p_position_name: newLeader.position_name.trim() || "Head",
        p_started_at: `${newLeader.started_at}T00:00:00Z`,
        p_ended_at: newLeader.ended_at ? `${newLeader.ended_at}T23:59:59.999Z` : null,
        p_is_vacant: newLeader.is_vacant,
        p_notes: newLeader.notes.trim() || null,
      });
      if (error) throw error;
      await loadLeadership();
      setNewLeader({ id: null, person_name: "", position_name: "Head", started_at: "", ended_at: "", is_vacant: false, notes: "" });
      toast.success("Leadership record saved");
    } catch (error) { toast.error(error?.message || "Unable to save leadership"); } finally { setLeadershipSaving(false); }
  };

  const editLeadership = (record) => setNewLeader({
    id: record.id,
    person_name: record.person_name === "Vacant" ? "" : record.person_name,
    position_name: record.position_name || "Head",
    started_at: record.started_at ? new Date(record.started_at).toISOString().slice(0, 10) : "",
    ended_at: record.ended_at ? new Date(record.ended_at).toISOString().slice(0, 10) : "",
    is_vacant: record.is_vacant,
    notes: record.notes || "",
  });

  const deleteLeadership = async (id) => {
    const { error } = await supabase.rpc("delete_governance_leadership", { p_id: id });
    if (error) return toast.error(error.message || "Unable to delete leadership record");
    setLeadership((current) => current.filter((item) => item.id !== id));
    toast.success("Leadership record removed");
  };

  const refreshResources = async () => {
    const [{ data: attachmentData }, { data: linkData }] = await Promise.all([
      supabase.from("attachment").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("link").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
    ]);
    setAttachments(attachmentData || []); setLinks(linkData || []);
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <div className="flex items-start gap-3 pr-8">
        <Avatar className="h-12 w-12 shrink-0 rounded-xl"><AvatarImage src={(editing ? draft?.image_url : entity.image_url) || undefined} alt="" /><AvatarFallback className="rounded-xl">{getGovernanceInitials(label)}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          {editing ? <Input autoFocus value={draft?.name || ""} onChange={(event) => updateDraft("name", event.target.value)} className="text-lg font-semibold" /> : <><h2 className="truncate text-xl font-semibold" title={label}>{label}</h2>{categoryName && <p className="mt-0.5 truncate text-sm text-muted-foreground" title={categoryName}>{categoryName}</p>}</>}
        </div>
        {canEdit && !editing && <MenuButton onEdit={() => setEditing(true)} onAddParent={() => onAddParent?.(entity)} onAddChild={() => onAddChild?.(entity)} onChangeParent={() => onChangeParent?.(entity)} onDelete={handleDelete} deleteTitle={`Delete ${label}?`} deleteDescription={childEntities.length ? "Move the child entities before deleting this entity." : "This permanently removes this governance entity."} />}
      </div>

      {editing ? <div className="space-y-5 py-2">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Short name"><Input value={draft?.short_name || ""} onChange={(event) => updateDraft("short_name", event.target.value)} /></Field><Field label="Entity type"><Select value={draft?.entity_type || "authority"} onValueChange={(value) => updateDraft("entity_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOVERNANCE_ENTITY_TYPES.map((type) => <SelectItem key={type} value={type}>{formatGovernanceType(type)}</SelectItem>)}</SelectContent></Select></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><Select value={draft?.category_id || "none"} onValueChange={(value) => updateDraft("category_id", value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No category</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field><Field label="Status"><Select value={currentStatus} onValueChange={(value) => updateDraft("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOVERNANCE_STATUS_OPTIONS.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></Field></div>
        <Field label="What they do"><Textarea value={draft?.description || ""} onChange={(event) => updateDraft("description", event.target.value)} rows={4} /></Field>
        <Field label="Official website"><Input type="url" value={draft?.website || ""} onChange={(event) => updateDraft("website", event.target.value)} placeholder="https://" /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={draft?.valid_from || ""} onChange={(event) => updateDraft("valid_from", event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={draft?.valid_to || ""} onChange={(event) => updateDraft("valid_to", event.target.value)} disabled={!requiresValidTo} /></Field></div>
        <ImageUpload bucket="governance" path={`governance/${entity.id}/logo`} value={draft?.image_url || null} onChange={(value) => updateDraft("image_url", value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
        <section className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Leadership history</p><p className="text-xs text-muted-foreground">Record who held this position, including vacancies.</p></div><Button type="button" size="sm" variant="outline" onClick={() => setNewLeader({ id: null, person_name: "", position_name: "Head", started_at: "", ended_at: "", is_vacant: false, notes: "" })}><Plus className="mr-1.5 h-4 w-4" />Add</Button></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Position"><Input value={newLeader.position_name} onChange={(event) => setNewLeader((current) => ({ ...current, position_name: event.target.value }))} /></Field><Field label="Person"><Input value={newLeader.person_name} onChange={(event) => setNewLeader((current) => ({ ...current, person_name: event.target.value }))} disabled={newLeader.is_vacant} placeholder="Name" /></Field></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Started"><Input type="date" value={newLeader.started_at} onChange={(event) => setNewLeader((current) => ({ ...current, started_at: event.target.value }))} /></Field><Field label="Ended"><Input type="date" value={newLeader.ended_at} onChange={(event) => setNewLeader((current) => ({ ...current, ended_at: event.target.value }))} /></Field></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newLeader.is_vacant} onChange={(event) => setNewLeader((current) => ({ ...current, is_vacant: event.target.checked, person_name: event.target.checked ? "" : current.person_name }))} />Position was vacant</label>
          {newLeader.notes && <Field label="Notes"><Textarea value={newLeader.notes} onChange={(event) => setNewLeader((current) => ({ ...current, notes: event.target.value }))} rows={2} /></Field>}
          <Button type="button" size="sm" onClick={saveLeadership} disabled={leadershipSaving}>{leadershipSaving ? "Saving..." : newLeader.id ? "Update record" : "Save record"}</Button>
          {leadershipLoading ? <p className="text-xs text-muted-foreground">Loading leadership…</p> : sortedLeadership.length > 0 && <div className="space-y-2">{sortedLeadership.map((record) => <div key={record.id} className="flex items-center justify-between gap-3 rounded-md bg-muted/30 p-2"><div className="min-w-0"><p className="truncate text-sm font-medium">{record.is_vacant ? "Vacant" : record.person_name}</p><p className="text-xs text-muted-foreground">{record.position_name} · {formatDate(record.started_at)}{record.ended_at ? ` – ${formatDate(record.ended_at)}` : " – present"}</p></div><div className="flex shrink-0 gap-1"><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editLeadership(record)} title="Edit"><Save className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLeadership(record.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button></div></div>)}</div>}
        </section>
        <GovernanceResources governanceId={entity.id} attachments={attachments} links={links} canEdit onChanged={refreshResources} />
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setEditing(false); setDraft(null); }} disabled={saving}><X className="mr-2 h-4 w-4" />Cancel</Button><Button type="button" onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save changes"}</Button></div>
      </div> : <div className="space-y-5 py-1">
        {(entity.valid_from || entity.valid_to || jurisdiction || currentLeader) && <div className="grid grid-cols-2 gap-2">
          {(entity.valid_from || entity.valid_to) && <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{entity.valid_to ? "Since / until" : "Since"}</p><p className="mt-1 truncate text-sm font-medium">{formatDate(entity.valid_from)}{entity.valid_to ? ` – ${formatDate(entity.valid_to)}` : ""}</p></div>}
          {jurisdiction && <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Jurisdiction</p><p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-medium"><MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><span className="truncate" title={jurisdiction}>{jurisdiction}</span></p></div>}
        </div>}
        {currentLeader && <section><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current head</p><div className="mt-1 rounded-lg border bg-muted/30 p-3"><p className="text-sm font-medium">{currentLeader.is_vacant ? "Vacant" : currentLeader.person_name}</p><p className="text-xs text-muted-foreground">{currentLeader.position_name} · since {formatDate(currentLeader.started_at)}</p></div></section>}
        {entity.description && <section><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What they do</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{entity.description}</p></section>}
        {(parent || childEntities.length > 0) && <section className="space-y-3">{parent && <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Under</p><RelationItem entity={parent} onSelect={onSelect} /></div>}{childEntities.length > 0 && <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Responsible for</p><div className="grid gap-1 sm:grid-cols-2">{childEntities.map((child) => <RelationItem key={child.id} entity={child} onSelect={onSelect} />)}</div></div>}</section>}
      </div>}
    </DialogContent>
  </Dialog>;
}
