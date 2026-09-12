import { useEffect, useMemo, useState } from "react";
import { ImagePlus, UsersRound, X } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceInitials } from "@/utils/governance";

const CREATE_ROLE = "__create_role__";
const CREATE_PERSON = "__create_person__";
const NONE = "none";

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function dateInputValue(value) {
  return value ? String(value).slice(0, 10) : "";
}

function fileExtension(file) {
  const extension = file?.name?.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "png";
}

async function uploadGovernanceAvatar(entityId, kind, file) {
  if (!entityId || !file) return null;
  if (!file.type?.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");

  const path = `governance/${entityId}/${kind}-avatar.${fileExtension(file)}`;
  const { error } = await supabase.storage.from("governance").upload(path, file, { upsert: true, cacheControl: "31536000", contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("governance").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Avatar uploaded, but no public URL was returned.");
  return data.publicUrl;
}

function AvatarPicker({ label, value, name, onChange, disabled = false }) {
  const [preview, setPreview] = useState(value || null);
  useEffect(() => setPreview(value || null), [value]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  const choose = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be 5 MB or smaller.");
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    const next = URL.createObjectURL(file);
    setPreview(next);
    onChange?.({ file, removed: false });
  };
  const remove = () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); setPreview(null); onChange?.({ file: null, removed: true }); };

  return <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3"><Avatar className="h-12 w-12 shrink-0 rounded-lg"><AvatarImage src={preview || undefined} alt="" /><AvatarFallback className="rounded-lg">{getGovernanceInitials(name || label)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">Optional · PNG, JPG or WebP · up to 5 MB</p><div className="mt-2 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"><ImagePlus className="mr-1.5 h-3.5 w-3.5" />{preview ? "Change" : "Add avatar"}<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={disabled} onChange={choose} /></label>{preview && <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={disabled} className="h-7 px-2 text-xs"><X className="mr-1.5 h-3.5 w-3.5" />Remove</Button>}</div></div></div>;
}

async function findExactProfile(name) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return null;
  const result = await supabase.from("profile").select("user_id,name,avatar_url").ilike("name", name.trim()).limit(5);
  if (result.error) throw result.error;
  const matches = (result.data || []).filter((profile) => profile?.name?.trim().toLowerCase() === normalized);
  return matches.length === 1 ? matches[0] : null;
}

export default function GovernanceOrganizationDialog({ open, onOpenChange, governanceId, record = null, candidates = [], records = [], onSaved }) {
  const [positionId, setPositionId] = useState("");
  const [positionName, setPositionName] = useState("");
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState("");
  const [positions, setPositions] = useState([]);
  const [people, setPeople] = useState([]);
  const [roleAvatarUrl, setRoleAvatarUrl] = useState(null);
  const [personAvatarUrl, setPersonAvatarUrl] = useState(null);
  const [roleAvatarFile, setRoleAvatarFile] = useState(null);
  const [personAvatarFile, setPersonAvatarFile] = useState(null);
  const [removeRoleAvatar, setRemoveRoleAvatar] = useState(false);
  const [removePersonAvatar, setRemovePersonAvatar] = useState(false);
  const [reportsToId, setReportsToId] = useState(NONE);
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [isVacant, setIsVacant] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const loadCandidates = async () => {
      const [positionResult, personResult] = await Promise.all([
        supabase.from("position").select("id,governance_id,name,slug,description,image_url,profile_user_id,appointing_governance_id").order("name"),
        supabase.from("person").select("id,governance_id,name,slug,image_url,profile_user_id,biography,website").order("name"),
      ]);
      if (cancelled) return;
      if (positionResult.error) return toast.error(positionResult.error.message);
      if (personResult.error) return toast.error(personResult.error.message);
      setPositions(positionResult.data || []);
      setPeople(personResult.data || []);
    };
    loadCandidates();
    return () => { cancelled = true; };
  }, [open]);

  const managedRoles = useMemo(() => records.filter((item) => item.parent_id === record?.id), [records, record]);
  const reportingOptions = useMemo(() => records.filter((item) => item.id !== record?.id), [records, record]);

  useEffect(() => {
    if (!open) return;
    const selectedPosition = positions.find((item) => item.governance_id === record?.position_governance_id || item.id === record?.position_id);
    const selectedPerson = people.find((item) => item.governance_id === record?.person_governance_id || item.id === record?.person_id);
    setPositionId(selectedPosition?.governance_id || record?.position_governance_id || "");
    setPositionName(record?.position_name || selectedPosition?.name || "");
    setPersonId(selectedPerson?.governance_id || record?.person_governance_id || "");
    setPersonName(record?.is_vacant ? "" : record?.person_name || selectedPerson?.name || "");
    setRoleAvatarUrl(selectedPosition?.image_url || record?.position_avatar_url || null);
    setPersonAvatarUrl(selectedPerson?.image_url || record?.person_avatar_url || null);
    setRoleAvatarFile(null);
    setPersonAvatarFile(null);
    setRemoveRoleAvatar(false);
    setRemovePersonAvatar(false);
    setReportsToId(record?.parent_id || NONE);
    setStartedAt(record?.started_at ? dateInputValue(record.started_at) : new Date().toISOString().slice(0, 10));
    setEndedAt(dateInputValue(record?.ended_at));
    setIsVacant(!!record?.is_vacant);
    setIsPrimary(!!record?.is_primary);
  }, [open, record, positions, people]);

  const saveEntityAvatar = async ({ entityId, kind, file, currentUrl, remove }) => {
    if (!entityId) return null;
    if (file) return uploadGovernanceAvatar(entityId, kind, file);
    if (remove) return null;
    return currentUrl || null;
  };

  const save = async () => {
    if (!governanceId) return;
    if (!positionName.trim() && !positionId) return toast.error("Role is required");
    if (!startedAt) return toast.error("Valid from is required");
    if (endedAt && endedAt < startedAt) return toast.error("Valid to cannot be earlier than valid from");
    if (!isVacant && !personName.trim() && !personId) return toast.error("Person is required unless the role is vacant");

    try {
      setSaving(true);
      let nextPositionId = positionId;
      const nextPositionName = positionName.trim();
      let nextPersonId = isVacant ? null : personId;
      const nextPersonName = isVacant ? "Vacant" : personName.trim();
      let profileUserId = null;

      if (!nextPositionId) {
        const result = await supabase.rpc("create_position", { p_name: nextPositionName, p_description: null, p_image_url: null, p_category_id: null, p_metadata: {} });
        if (!result || result.error) throw result?.error || new Error("Unable to create role");
        nextPositionId = result.data?.governance_id;
        if (!nextPositionId) throw new Error("Unable to create role");
      }

      if (!isVacant && nextPersonId) {
        profileUserId = people.find((item) => item.governance_id === nextPersonId)?.profile_user_id || null;
      }

      if (!isVacant && !nextPersonId) {
        const result = await supabase.rpc("create_person", { p_name: nextPersonName, p_biography: null, p_website: null, p_image_url: null, p_profile_user_id: null, p_metadata: {} });
        if (!result || result.error) throw result?.error || new Error("Unable to create person");
        nextPersonId = result.data?.governance_id;
        if (!nextPersonId) throw new Error("Unable to create person");
      }

      const roleImageUrl = await saveEntityAvatar({ entityId: nextPositionId, kind: "position", file: roleAvatarFile, currentUrl: roleAvatarUrl, remove: removeRoleAvatar });
      const personImageUrl = !isVacant ? await saveEntityAvatar({ entityId: nextPersonId, kind: "person", file: personAvatarFile, currentUrl: personAvatarUrl, remove: removePersonAvatar }) : null;

      const avatarUpdates = [];
      if (nextPositionId) avatarUpdates.push({ id: nextPositionId, url: roleImageUrl });
      if (!isVacant && nextPersonId) avatarUpdates.push({ id: nextPersonId, url: personImageUrl });
      for (const item of avatarUpdates) {
        const updateResult = await supabase.rpc("update_governance_image", { p_governance_id: item.id, p_image_url: item.url });
        if (!updateResult || updateResult.error) throw updateResult?.error || new Error("Unable to save avatar");
      }

      if (!isVacant && nextPersonId) profileUserId = profileUserId || (await findExactProfile(nextPersonName))?.user_id || null;
      if (profileUserId && nextPersonId) {
        const profileResult = await supabase.rpc("set_governance_person_profile", { p_person_id: people.find((item) => item.governance_id === nextPersonId)?.id || nextPersonId, p_profile_user_id: profileUserId });
        if (!profileResult || profileResult.error) throw profileResult?.error || new Error("Unable to link person profile");
      }

      const result = await supabase.rpc("upsert_organization", {
        p_id: record?.id || null,
        p_governance_id: governanceId,
        p_person_name: isVacant ? "Vacant" : nextPersonName,
        p_person_governance_id: isVacant ? null : nextPersonId,
        p_position_name: nextPositionName,
        p_position_governance_id: nextPositionId,
        p_started_at: `${startedAt}T00:00:00Z`,
        p_ended_at: endedAt ? `${endedAt}T23:59:59.999Z` : null,
        p_is_vacant: isVacant,
        p_is_primary: isPrimary,
        p_reports_to_id: reportsToId === NONE ? null : reportsToId,
        p_notes: null,
      });
      if (!result || result.error) throw result?.error || new Error("Unable to save organization role");

      await onSaved?.(result.data);
      toast.success(record ? "Role updated" : "Role added");
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save organization role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><UsersRound className="h-4 w-4" />{record ? "Edit role assignment" : "Add role assignment"}</DialogTitle></DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <AvatarPicker label="Role avatar" name={positionName} value={roleAvatarUrl} disabled={saving} onChange={({ file, removed }) => { setRoleAvatarFile(file); setRemoveRoleAvatar(removed); if (removed) setRoleAvatarUrl(null); }} />
            <AvatarPicker label="Person avatar" name={personName} value={personAvatarUrl} disabled={saving || isVacant} onChange={({ file, removed }) => { setPersonAvatarFile(file); setRemovePersonAvatar(removed); if (removed) setPersonAvatarUrl(null); }} />
          </div>

          <Field label="Role"><Select value={positionId || (positionName ? CREATE_ROLE : "")} onValueChange={(value) => { if (value === CREATE_ROLE) { setPositionId(""); setPositionName(""); setRoleAvatarUrl(null); setRoleAvatarFile(null); setRemoveRoleAvatar(false); return; } const selected = positions.find((item) => item.governance_id === value); setPositionId(value); setPositionName(selected?.name || ""); setRoleAvatarUrl(selected?.image_url || null); setRoleAvatarFile(null); setRemoveRoleAvatar(false); }}><SelectTrigger><SelectValue placeholder="Choose a role" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value={CREATE_ROLE}>Create new role</SelectItem>{positions.map((item) => <SelectItem key={item.governance_id || item.id} value={item.governance_id || item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field>

          <Field label="Person"><Select value={isVacant ? NONE : personId || (personName ? CREATE_PERSON : "")} disabled={isVacant} onValueChange={(value) => { if (value === CREATE_PERSON) { setPersonId(""); setPersonName(""); setPersonAvatarUrl(null); setPersonAvatarFile(null); setRemovePersonAvatar(false); return; } if (value === NONE) { setPersonId(""); setPersonName(""); return; } const selected = people.find((item) => item.governance_id === value); setPersonId(value); setPersonName(selected?.name || ""); setPersonAvatarUrl(selected?.image_url || null); setPersonAvatarFile(null); setRemovePersonAvatar(false); }}><SelectTrigger><SelectValue placeholder="Choose a person" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value={NONE}>No person</SelectItem><SelectItem value={CREATE_PERSON}>Create new person</SelectItem>{people.map((item) => <SelectItem key={item.governance_id || item.id} value={item.governance_id || item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field>

          <Field label="Reports to"><Select value={reportsToId} onValueChange={setReportsToId}><SelectTrigger><SelectValue placeholder="Choose a reporting role" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value={NONE}>No reporting role</SelectItem>{reportingOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.position_name || item.person_name || item.id}</SelectItem>)}</SelectContent></Select></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={endedAt} onChange={(event) => setEndedAt(event.target.value)} /></Field></div>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={isVacant} onCheckedChange={(checked) => { setIsVacant(checked === true); if (checked === true) { setPersonId(""); setPersonName(""); } }} />Position is vacant</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={isPrimary} onCheckedChange={(checked) => setIsPrimary(checked === true)} />Primary role</label>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save role"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
