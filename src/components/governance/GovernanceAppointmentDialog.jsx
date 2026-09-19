"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUpload from "@/components/media/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase/client";

const CREATE_PERSON = "__create_person__";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function GovernanceAppointmentDialog({
  open,
  onOpenChange,
  mode = "position",
  organizationId = null,
  positionId = null,
  personId = null,
  record = null,
  onSaved,
}) {
  const positionMode = mode === "position";
  const personMode = mode === "person";
  const draftId = useId().replace(/:/g, "");

  const [organizations, setOrganizations] = useState([]);
  const [positions, setPositions] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(organizationId || "");
  const [selectedPositionId, setSelectedPositionId] = useState(positionId || "");
  const [selectedPersonId, setSelectedPersonId] = useState(personId || "");
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonImageUrl, setNewPersonImageUrl] = useState("");
  const [startedAt, setStartedAt] = useState(today());
  const [endedAt, setEndedAt] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const creatingPerson = positionMode && selectedPersonId === CREATE_PERSON;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setSelectedOrganizationId(record?.organization_id || organizationId || "");
    setSelectedPositionId(record?.position_id || positionId || "");
    setSelectedPersonId(record?.person_id || personId || "");
    setNewPersonName("");
    setNewPersonImageUrl("");
    setStartedAt(record?.started_at ? String(record.started_at).slice(0, 10) : today());
    setEndedAt(record?.ended_at ? String(record.ended_at).slice(0, 10) : "");
    setIsPrimary(record?.is_primary ?? true);

    const load = async () => {
      const [organizationResult, positionResult, peopleResult] = await Promise.all([
        supabase.from("governance").select("id,name,short_name,slug,type,status").neq("status", "deleted").order("name").limit(500),
        supabase.from("position").select("id,name,slug,appointing_organization_id").order("name").limit(1000),
        supabase.from("person").select("id,name,slug,image_url,profile_user_id").order("name").limit(1000),
      ]);

      if (cancelled) return;
      setLoading(false);

      if (organizationResult.error) return toast.error(organizationResult.error.message);
      if (positionResult.error) return toast.error(positionResult.error.message);
      if (peopleResult.error) return toast.error(peopleResult.error.message);

      setOrganizations(organizationResult.data || []);
      setPositions(positionResult.data || []);
      setPeople(peopleResult.data || []);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, organizationId, positionId, personId, record?.id]);

  useEffect(() => {
    if (!personMode || !selectedOrganizationId || !selectedPositionId) return;
    const selected = positions.find((item) => item.id === selectedPositionId);
    if (selected && selected.appointing_organization_id !== selectedOrganizationId) setSelectedPositionId("");
  }, [personMode, selectedOrganizationId, selectedPositionId, positions]);

  const organizationOptions = useMemo(
    () => organizations.map((item) => ({ value: item.id, label: item.name, searchValue: `${item.name || ""} ${item.short_name || ""}` })),
    [organizations],
  );

  const positionOptions = useMemo(() => {
    const filtered = positions.filter((item) => !selectedOrganizationId || item.appointing_organization_id === selectedOrganizationId);
    return filtered.map((item) => ({ value: item.id, label: item.name, searchValue: item.name }));
  }, [positions, selectedOrganizationId]);

  const peopleOptions = useMemo(
    () => [
      { value: CREATE_PERSON, label: "Create new person", searchValue: "create new person" },
      ...people.map((item) => ({ value: item.id, label: item.name, searchValue: item.name })),
    ],
    [people],
  );

  const selectedOrganization = organizations.find((item) => item.id === selectedOrganizationId);
  const selectedPosition = positions.find((item) => item.id === selectedPositionId);
  const selectedPerson = people.find((item) => item.id === selectedPersonId);

  const save = async () => {
    const finalOrganizationId = positionMode ? (organizationId || selectedOrganizationId) : selectedOrganizationId;
    const finalPositionId = positionMode ? (positionId || selectedPositionId) : selectedPositionId;

    if (!finalOrganizationId) return toast.error("Organization is required");
    if (!finalPositionId) return toast.error("Position is required");
    if (personMode && !personId) return toast.error("Person is required");
    if (positionMode && !creatingPerson && !selectedPersonId) return toast.error("Person is required");
    if (creatingPerson && !newPersonName.trim()) return toast.error("Person name is required");
    if (!startedAt) return toast.error("Start date is required");
    if (endedAt && endedAt < startedAt) return toast.error("End date cannot be earlier than start date");

    try {
      setSaving(true);

      let result;
      if (creatingPerson) {
        result = await supabase.rpc("create_person_appointment", {
          p_organization_id: finalOrganizationId,
          p_position_id: finalPositionId,
          p_started_at: `${startedAt}T00:00:00Z`,
          p_name: newPersonName.trim(),
          p_biography: null,
          p_website: null,
          p_image_url: newPersonImageUrl || null,
          p_profile_user_id: null,
          p_ended_at: endedAt ? `${endedAt}T23:59:59.999Z` : null,
          p_is_primary: isPrimary,
          p_notes: null,
        });
      } else {
        const finalPersonId = personMode ? personId : selectedPersonId;
        result = await supabase.rpc("upsert_organization", {
          p_id: record?.appointment_id || record?.id || null,
          p_governance_id: finalOrganizationId,
          p_person_name: selectedPerson?.name || "",
          p_person_governance_id: finalPersonId,
          p_position_name: selectedPosition?.name || "Position",
          p_position_governance_id: finalPositionId,
          p_started_at: `${startedAt}T00:00:00Z`,
          p_ended_at: endedAt ? `${endedAt}T23:59:59.999Z` : null,
          p_is_vacant: false,
          p_is_primary: isPrimary,
          p_reports_to_id: null,
          p_notes: null,
        });
      }

      if (result.error) throw result.error;

      toast.success(positionMode ? "Person added to position" : "Position added to person");
      await onSaved?.(result.data);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save appointment");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = Boolean(record?.appointment_id || record?.id);\n  const title = isEditing ? "Edit appointment" : positionMode ? "Add person to position" : "Add position to person";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {positionMode ? <UserRound className="h-4 w-4" /> : <BriefcaseBusiness className="h-4 w-4" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4"><div className="h-9 animate-pulse rounded-md bg-muted" /><div className="h-9 animate-pulse rounded-md bg-muted" /><div className="h-20 animate-pulse rounded-md bg-muted" /></div>
        ) : (
          <div className="space-y-4 py-2">
            {positionMode ? (
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Position</div><div className="mt-1 text-sm font-medium">{selectedPosition?.name || "Position"}</div><div className="text-xs text-muted-foreground">{selectedOrganization?.name || "Organization"}</div></div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Person</div><div className="mt-1 text-sm font-medium">{selectedPerson?.name || "Person"}</div></div>
            )}

            {personMode && <div className="space-y-2"><Label>Organization</Label><SearchableSelect value={selectedOrganizationId} onValueChange={setSelectedOrganizationId} options={organizationOptions} placeholder="Choose an organization" searchPlaceholder="Search organizations..." emptyText="No organizations found." disabled={saving} /></div>}
            {personMode && <div className="space-y-2"><Label>Position</Label><SearchableSelect value={selectedPositionId} onValueChange={setSelectedPositionId} options={positionOptions} placeholder={selectedOrganizationId ? "Choose a position" : "Choose an organization first"} searchPlaceholder="Search positions..." emptyText="No positions found for this organization." disabled={saving || !selectedOrganizationId} /></div>}
            {positionMode && <div className="space-y-2"><Label>Person</Label><SearchableSelect value={selectedPersonId} onValueChange={setSelectedPersonId} options={peopleOptions} placeholder="Choose a person" searchPlaceholder="Search people..." emptyText="No people found." disabled={saving} /></div>}

            {creatingPerson && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="text-sm font-medium">New person</div>
                <ImageUpload bucket="governance" path={`governance/person/draft-${draftId}`} value={newPersonImageUrl || null} onChange={(value) => setNewPersonImageUrl(value || "")} label="Person image" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
                <div className="space-y-2"><Label htmlFor="governance-appointment-new-person">Name</Label><Input id="governance-appointment-new-person" value={newPersonName} onChange={(event) => setNewPersonName(event.target.value)} placeholder="e.g. Jane Doe" disabled={saving} autoFocus /></div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Start date</Label><Input type="date" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} disabled={saving} /></div><div className="space-y-2"><Label>End date</Label><Input type="date" value={endedAt} onChange={(event) => setEndedAt(event.target.value)} disabled={saving} /></div></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><div className="text-sm font-medium">Primary appointment</div><div className="text-xs text-muted-foreground">Use this for the person’s current or principal appointment.</div></div><Checkbox checked={isPrimary} disabled={saving} onCheckedChange={(checked) => setIsPrimary(!!checked)} /></div>
          </div>
        )}

        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button><Button type="button" onClick={save} disabled={saving || loading}>{saving ? "Saving..." : isEditing ? "Save changes" : positionMode ? "Add person" : "Add position"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
