import { useEffect, useMemo, useState } from "react";
import { UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase/client";
import SearchableSelect from "@/components/ui/SearchableSelect";

const CREATE_ROLE = "__create_role__";
const CREATE_PERSON = "__create_person__";
const NONE = "none";

function dateInputValue(value) { return value ? String(value).slice(0, 10) : ""; }
function Field({ label, children }) { return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>; }

export default function GovernanceOrganizationDialog({ open, onOpenChange, governanceId, record = null, records = [], onSaved }) {
  const [positionId, setPositionId] = useState("");
  const [positionName, setPositionName] = useState("");
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState("");
  const [positions, setPositions] = useState([]);
  const [people, setPeople] = useState([]);
  const [reportsToId, setReportsToId] = useState(NONE);
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [isVacant, setIsVacant] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !governanceId) return;
    let cancelled = false;
    const load = async () => {
      const [positionResult, personResult] = await Promise.all([
        supabase.from("position").select("id,name,slug,image_url").eq("appointing_organization_id", governanceId).order("name"),
        supabase.from("person").select("id,name,slug,image_url,profile_user_id").order("name"),
      ]);
      if (cancelled) return;
      if (positionResult.error) return toast.error(positionResult.error.message);
      if (personResult.error) return toast.error(personResult.error.message);
      setPositions(positionResult.data || []);
      setPeople(personResult.data || []);
    };
    load();
    return () => { cancelled = true; };
  }, [open, governanceId]);

  useEffect(() => {
    if (!open) return;
    const selectedPosition = positions.find((item) => item.id === record?.position_id);
    const selectedPerson = people.find((item) => item.id === record?.person_id);
    setPositionId(record?.position_id || "");
    setPositionName(record?.position_name || selectedPosition?.name || "");
    setPersonId(record?.person_id || "");
    setPersonName(record?.is_vacant ? "" : record?.person_name || selectedPerson?.name || "");
    setReportsToId(record?.parent_appointment_id || NONE);
    setStartedAt(dateInputValue(record?.started_at) || new Date().toISOString().slice(0, 10));
    setEndedAt(dateInputValue(record?.ended_at));
    setIsVacant(!!record?.is_vacant);
    setIsPrimary(!!record?.is_primary);
  }, [open, record, positions, people]);

  const positionOptions = useMemo(() => [
    { value: CREATE_ROLE, label: "Create new position", searchValue: "create new position" },
    ...positions.map((item) => ({ value: item.id, label: item.name, searchValue: item.name })),
  ], [positions]);

  const personOptions = useMemo(() => [
    { value: NONE, label: "No person", searchValue: "no person" },
    { value: CREATE_PERSON, label: "Create new person", searchValue: "create new person" },
    ...people.map((item) => ({ value: item.id, label: item.name, searchValue: item.name })),
  ], [people]);

  const reportsToOptions = useMemo(() => [
    { value: NONE, label: "No reporting position", searchValue: "no reporting position" },
    ...records
      .filter((item) => item.id !== record?.id)
      .map((item) => ({
        value: item.id,
        label: `${item.position_name || "Position"}${item.person_name ? ` · ${item.person_name}` : ""}`,
        searchValue: `${item.position_name || ""} ${item.person_name || ""}`,
      })),
  ], [records, record]);

  const save = async () => {
    if (!governanceId) return;
    if (!positionId && !positionName.trim()) return toast.error("Position is required");
    if (!isVacant && !personId && !personName.trim()) return toast.error("Person is required unless vacant");
    if (!startedAt) return toast.error("Start date is required");
    if (endedAt && endedAt < startedAt) return toast.error("End date cannot be earlier than start date");
    try {
      setSaving(true);
      let nextPositionId = positionId;
      let nextPersonId = isVacant ? null : personId;
      if (!nextPositionId) {
        const result = await supabase.rpc("create_position", { p_name: positionName.trim(), p_description: null, p_image_url: null, p_category_id: null, p_metadata: {} });
        if (result.error) throw result.error;
        nextPositionId = result.data?.id;
      }
      if (!nextPositionId) throw new Error("Unable to create position");
      if (!isVacant && !nextPersonId) {
        const result = await supabase.rpc("create_person", { p_name: personName.trim(), p_biography: null, p_website: null, p_image_url: null, p_profile_user_id: null, p_metadata: {} });
        if (result.error) throw result.error;
        nextPersonId = result.data?.id;
      }
      if (!isVacant && !nextPersonId) throw new Error("Unable to create person");
      const result = await supabase.rpc("upsert_organization", {
        p_id: record?.id || null,
        p_governance_id: governanceId,
        p_person_name: isVacant ? "Vacant" : personName.trim(),
        p_person_governance_id: nextPersonId,
        p_position_name: positionName.trim() || positions.find((item) => item.id === nextPositionId)?.name || "Head",
        p_position_governance_id: nextPositionId,
        p_started_at: `${startedAt}T00:00:00Z`,
        p_ended_at: endedAt ? `${endedAt}T23:59:59.999Z` : null,
        p_is_vacant: isVacant,
        p_is_primary: isPrimary,
        p_reports_to_id: reportsToId === NONE ? null : reportsToId,
        p_notes: null,
      });
      if (result.error) throw result.error;
      await onSaved?.(result.data);
      toast.success(record ? "Appointment updated" : "Appointment added");
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save appointment");
    } finally { setSaving(false); }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><UsersRound className="h-4 w-4" />{record ? "Edit appointment" : "Add appointment"}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-2">
        <Field label="Position">
          <SearchableSelect
            value={positionId || (positionName ? CREATE_ROLE : "")}
            onValueChange={(value) => {
              if (value === CREATE_ROLE) { setPositionId(""); setPositionName(""); return; }
              const selected = positions.find((item) => item.id === value);
              setPositionId(value); setPositionName(selected?.name || "");
            }}
            options={positionOptions}
            placeholder="Choose a position"
            searchPlaceholder="Search positions in this organization..."
            emptyText="No positions found in this organization."
            disabled={saving}
          />
        </Field>
        {!positionId && <Field label="New position name"><Input value={positionName} onChange={(event) => setPositionName(event.target.value)} placeholder="e.g. Commissioner" disabled={saving} /></Field>}

        <Field label="Person">
          <SearchableSelect
            value={isVacant ? NONE : personId || (personName ? CREATE_PERSON : "")}
            onValueChange={(value) => {
              if (value === CREATE_PERSON) { setPersonId(""); setPersonName(""); return; }
              if (value === NONE) { setPersonId(""); setPersonName(""); return; }
              const selected = people.find((item) => item.id === value);
              setPersonId(value); setPersonName(selected?.name || "");
            }}
            options={personOptions}
            placeholder="Choose a person"
            searchPlaceholder="Search people by name..."
            emptyText="No people found."
            disabled={saving || isVacant}
          />
        </Field>
        {!personId && !isVacant && <Field label="New person name"><Input value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="e.g. Jane Doe" disabled={saving} /></Field>}

        <div className="grid gap-3 sm:grid-cols-2"><Field label="Start date"><Input type="date" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} disabled={saving} /></Field><Field label="End date"><Input type="date" value={endedAt} onChange={(event) => setEndedAt(event.target.value)} disabled={saving} /></Field></div>
        <Field label="Reports to"><SearchableSelect value={reportsToId} onValueChange={setReportsToId} options={reportsToOptions} placeholder="No reporting position" searchPlaceholder="Search reporting positions..." emptyText="No reporting positions found." disabled={saving} /></Field>

        <div className="flex items-center justify-between rounded-lg border p-3"><div><div className="text-sm font-medium">Vacant position</div><div className="text-xs text-muted-foreground">No person is assigned to this appointment.</div></div><Checkbox checked={isVacant} disabled={saving} onCheckedChange={(checked) => { setIsVacant(!!checked); if (checked) { setPersonId(""); setPersonName(""); } }} /></div>
        <div className="flex items-center justify-between rounded-lg border p-3"><div><div className="text-sm font-medium">Primary appointment</div><div className="text-xs text-muted-foreground">Use this when the person has multiple appointments.</div></div><Checkbox checked={isPrimary} disabled={saving} onCheckedChange={(checked) => setIsPrimary(!!checked)} /></div>
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button><Button type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
