import { useEffect, useState } from "react";
import { MapPin, Save, X } from "lucide-react";
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
import OSMJurisdictionPicker from "@/components/governance/OSMJurisdictionPicker";
import { supabase } from "@/lib/supabase/client";
import { GOVERNANCE_ENTITY_TYPES, GOVERNANCE_STATUS_OPTIONS, formatGovernanceType, getGovernanceInitials, getGovernanceLabel, governanceRequiresValidTo } from "@/utils/governance";

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function RelationItem({ entity, onSelect }) {
  if (!entity) return null;
  return <button type="button" onClick={() => onSelect?.(entity)} className="flex min-w-0 items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-muted/60"><Avatar className="h-8 w-8 shrink-0 rounded-md"><AvatarImage src={entity.image_url || undefined} alt="" /><AvatarFallback className="rounded-md text-[10px]">{getGovernanceInitials(entity.name)}</AvatarFallback></Avatar><span className="min-w-0 truncate text-sm font-medium" title={entity.name}>{entity.name}</span></button>;
}

export default function GovernanceEntityModal({ open, onOpenChange, entity, parent, childEntities = [], canEdit = false, onSelect, onSaved, onDeleted, onAddChild, onAddParent, onChangeParent, categories = [] }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [links, setLinks] = useState([]);
  const [leader, setLeader] = useState(null);
  const [jurisdiction, setJurisdiction] = useState(null);

  useEffect(() => {
    if (!open || !entity) {
      if (!open) {
        setEditing(false);
        setDraft(null);
        setAttachments([]);
        setLinks([]);
        setLeader(null);
        setJurisdiction(null);
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

    const load = async () => {
      const leaderResult = await supabase.rpc("get_governance_leader_at", { p_entity_id: entity.id, p_at: new Date().toISOString() });
      if (!leaderResult || leaderResult.error) throw leaderResult?.error || new Error("Unable to load governance leader");
      const current = leaderResult.data?.[0] || null;
      if (current) {
        let role = current.position_governance_id ? null : { id: `role-${current.id}`, name: current.position_name, slug: null };
        let person = current.person_governance_id ? null : current.person_name ? { id: `person-${current.id}`, name: current.person_name, slug: null } : null;
        const ids = [current.position_governance_id, current.person_governance_id].filter(Boolean);
        if (ids.length) {
          const relatedResult = await supabase.from("governance").select("id,name,short_name,entity_type,image_url,status,slug").in("id", ids);
          if (!relatedResult || relatedResult.error) throw relatedResult?.error || new Error("Unable to load governance leadership links");
          const byId = new Map((relatedResult.data || []).map((item) => [item.id, item]));
          role = current.position_governance_id ? byId.get(current.position_governance_id) || null : role;
          person = current.person_governance_id ? byId.get(current.person_governance_id) || null : person;
        }
        setLeader({ ...current, role, person });
      } else {
        setLeader(null);
      }

      const unitResult = await supabase.from("governance_unit").select("metadata").eq("entity_id", entity.id).maybeSingle();
      if (unitResult?.error) throw unitResult.error;
      const osmJurisdiction = unitResult?.data?.metadata?.osm_jurisdiction;
      setJurisdiction(osmJurisdiction || null);

      const [{ data: attachmentData, error: attachmentError }, { data: linkData, error: linkError }] = await Promise.all([
        supabase.from("attachment").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("link").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      ]);
      if (attachmentError) throw attachmentError;
      if (linkError) throw linkError;
      setAttachments(attachmentData || []);
      setLinks(linkData || []);
    };

    load().catch((error) => toast.error(error?.message || "Unable to load governance details"));
  }, [open, entity]);

  if (!entity) return null;

  const label = getGovernanceLabel(entity);
  const categoryName = categories.find((item) => item.id === entity.category_id)?.name || entity.category_name || null;
  const currentStatus = draft?.status || entity.status || "active";
  const requiresValidTo = governanceRequiresValidTo(currentStatus);
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const leaderName = leader?.is_vacant ? "Vacant" : leader?.person?.name || leader?.person_name || null;
  const leaderRole = leader?.role?.name || leader?.position_name || null;
  const jurisdictionName = jurisdiction?.name || entity.jurisdiction || entity.location_name || entity.location_label || entity.address || null;

  const save = async () => {
    if (!draft?.name?.trim()) return toast.error("Name is required");
    if (!draft.valid_from) return toast.error("Valid from is required");
    if (draft.valid_to && draft.valid_from && draft.valid_to < draft.valid_from) return toast.error("Valid to cannot be earlier than valid from");
    if (requiresValidTo && !draft.valid_to) return toast.error("Add the date this entity became inactive");

    try {
      setSaving(true);
      const result = await supabase.rpc("update_governance_entity", {
        p_entity_id: entity.id,
        p_name: draft.name.trim(),
        p_short_name: draft.short_name.trim() || null,
        p_description: draft.description.trim() || null,
        p_website: draft.website.trim() || null,
        p_entity_type: draft.entity_type,
        p_status: currentStatus,
        p_valid_from: `${draft.valid_from}T00:00:00Z`,
        p_valid_to: draft.valid_to ? `${draft.valid_to}T23:59:59.999Z` : null,
        p_image_url: draft.image_url || null,
        p_category_id: draft.category_id || null,
      });
      if (!result || result.error) throw result?.error || new Error("Unable to save governance entity");

      if (jurisdiction?.osm_id && jurisdiction?.name && jurisdiction?.admin_level) {
        const jurisdictionResult = await supabase.rpc("set_governance_jurisdiction", {
          p_entity_id: entity.id,
          p_osm_type: jurisdiction.osm_type || "relation",
          p_osm_id: Number(jurisdiction.osm_id),
          p_name: jurisdiction.name,
          p_admin_level: Number(jurisdiction.admin_level),
          p_geojson: jurisdiction.geojson || null,
        });
        if (!jurisdictionResult || jurisdictionResult.error) throw jurisdictionResult?.error || new Error("Unable to save OSM jurisdiction");
      }

      setEditing(false);
      setDraft(null);
      onSaved?.(result.data);
      toast.success("Governance entity updated");
    } catch (error) {
      toast.error(error?.message || "Unable to save governance entity");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (childEntities.length > 0) return toast.error("Move the child entities before deleting this entity.");
    const result = await supabase.rpc("delete_governance_entity", { p_entity_id: entity.id });
    if (!result || result.error) return toast.error(result?.error?.message || "Unable to delete governance entity");
    toast.success("Governance entity deleted");
    onDeleted?.(entity);
    onOpenChange?.(false);
  };

  const refreshResources = async () => {
    const [attachmentResult, linkResult] = await Promise.all([
      supabase.from("attachment").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("link").select("*").eq("governance_id", entity.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
    ]);
    setAttachments(attachmentResult?.data || []);
    setLinks(linkResult?.data || []);
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
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={draft?.valid_from || ""} onChange={(event) => updateDraft("valid_from", event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={draft?.valid_to || ""} onChange={(event) => updateDraft("valid_to", event.target.value)} /></Field></div>
        <p className="-mt-3 text-xs text-muted-foreground">{requiresValidTo ? "Enter when this entity closed or was retired." : "Leave Valid to empty while active."}</p>
        <Field label="Jurisdiction"><OSMJurisdictionPicker value={jurisdiction} onChange={setJurisdiction} disabled={saving} /></Field>
        <ImageUpload bucket="governance" path={`governance/${entity.id}/logo`} value={draft?.image_url || null} onChange={(value) => updateDraft("image_url", value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
        <GovernanceResources governanceId={entity.id} attachments={attachments} links={links} canEdit onChanged={refreshResources} />
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setEditing(false); setDraft(null); }} disabled={saving}><X className="mr-2 h-4 w-4" />Cancel</Button><Button type="button" onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save changes"}</Button></div>
      </div> : <div className="space-y-5 py-1">
        {(jurisdictionName || leaderName || entity.valid_from || entity.valid_to) && <div className="grid gap-2 sm:grid-cols-2">
          {jurisdictionName && <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Jurisdiction</p><p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-medium"><MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><span className="truncate" title={jurisdictionName}>{jurisdictionName}</span></p></div>}
          {leaderName && <div className="rounded-lg border bg-muted/30 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Leader</p><p className="mt-1 truncate text-sm font-medium" title={leaderName}>{leaderName}</p>{leaderRole && <p className="mt-0.5 truncate text-xs text-muted-foreground" title={leaderRole}>{leaderRole}</p>}</div>}
          {(entity.valid_from || entity.valid_to) && <div className="rounded-lg border bg-muted/30 p-3 sm:col-span-2"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{entity.valid_to ? "Since / until" : "Since"}</p><p className="mt-1 truncate text-sm font-medium">{entity.valid_from ? new Date(entity.valid_from).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"}{entity.valid_to ? ` – ${new Date(entity.valid_to).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}` : ""}</p></div>}
        </div>}
        {entity.description && <section><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What they do</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{entity.description}</p></section>}
        {(parent || childEntities.length > 0) && <section className="space-y-3">{parent && <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Under</p><RelationItem entity={parent} onSelect={onSelect} /></div>}{childEntities.length > 0 && <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Responsible for</p><div className="grid gap-1 sm:grid-cols-2">{childEntities.map((child) => <RelationItem key={child.id} entity={child} onSelect={onSelect} />)}</div></div>}</section>}
      </div>}
    </DialogContent>
  </Dialog>;
}
