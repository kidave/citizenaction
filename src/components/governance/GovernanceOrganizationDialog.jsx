import { useEffect, useMemo, useState } from "react";
import { UsersRound } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";

const CREATE_ROLE = "__create_role__";
const CREATE_PERSON = "__create_person__";
const NONE = "none";

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function GovernanceOrganizationDialog({
  open,
  onOpenChange,
  governanceId,
  record = null,
  candidates = [],
  records = [],
  onSaved,
}) {
  const [positionId, setPositionId] = useState("");
  const [positionName, setPositionName] = useState("");
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState("");
  const [reportsToId, setReportsToId] = useState(NONE);
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [isVacant, setIsVacant] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  const positions = useMemo(
    () => candidates.filter((item) => item.entity_type === "position"),
    [candidates],
  );
  const people = useMemo(
    () => candidates.filter((item) => item.entity_type === "person"),
    [candidates],
  );
  const managedRoles = useMemo(
    () => records.filter((item) => item.parent_id === record?.id),
    [records, record],
  );
  const reportingOptions = useMemo(
    () => records.filter((item) => item.id !== record?.id),
    [records, record],
  );

  useEffect(() => {
    if (!open) return;
    setPositionId(record?.position_governance_id || "");
    setPositionName(record?.position_name || "");
    setPersonId(record?.person_governance_id || "");
    setPersonName(record?.is_vacant ? "" : record?.person_name || "");
    setReportsToId(record?.parent_id || NONE);
    setStartedAt(
      record?.started_at
        ? new Date(record.started_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    );
    setEndedAt(record?.ended_at ? new Date(record.ended_at).toISOString().slice(0, 10) : "");
    setIsVacant(!!record?.is_vacant);
    setIsPrimary(!!record?.is_primary);
  }, [open, record]);

  const save = async () => {
    if (!governanceId) return;
    if (!positionName.trim() && !positionId) return toast.error("Role is required");
    if (!startedAt) return toast.error("Valid from is required");
    if (endedAt && endedAt < startedAt) return toast.error("Valid to cannot be earlier than valid from");
    if (!isVacant && !personName.trim() && !personId) return toast.error("Person is required unless the role is vacant");

    try {
      setSaving(true);

      let nextPositionId = positionId;
      let nextPositionName = positionName.trim();
      let nextPersonId = isVacant ? null : personId;
      let nextPersonName = isVacant ? "Vacant" : personName.trim();

      if (!nextPositionId) {
        const result = await supabase.rpc("create_governance_entity", {
          p_name: nextPositionName,
          p_entity_type: "position",
          p_short_name: null,
          p_status: "active",
          p_valid_from: `${startedAt}T00:00:00Z`,
          p_valid_to: null,
          p_category_id: null,
          p_image_url: null,
        });
        if (!result || result.error) throw result?.error || new Error("Unable to create role");
        nextPositionId = result.data?.id;
        if (!nextPositionId) throw new Error("Unable to create role");
      }

      if (!isVacant && !nextPersonId) {
        const result = await supabase.rpc("create_governance_entity", {
          p_name: nextPersonName,
          p_entity_type: "person",
          p_short_name: null,
          p_status: "active",
          p_valid_from: `${startedAt}T00:00:00Z`,
          p_valid_to: null,
          p_category_id: null,
          p_image_url: null,
        });
        if (!result || result.error) throw result?.error || new Error("Unable to create person");
        nextPersonId = result.data?.id;
        if (!nextPersonId) throw new Error("Unable to create person");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersRound className="h-4 w-4" />
            {record ? "Edit role" : "Add role"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Field label="Role">
            <Select
              value={positionId || (positionName ? CREATE_ROLE : "")}
              onValueChange={(value) => {
                if (value === CREATE_ROLE) {
                  setPositionId("");
                  return;
                }
                setPositionId(value === NONE ? "" : value);
                const selected = positions.find((item) => item.id === value);
                if (selected) setPositionName(selected.name);
              }}
            >
              <SelectTrigger><SelectValue placeholder="Choose a role" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {positions.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                <SelectItem value={CREATE_ROLE}>Create a new role</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {!positionId && (
            <Field label="New role name">
              <Input value={positionName} onChange={(event) => setPositionName(event.target.value)} placeholder="e.g. Commissioner" />
            </Field>
          )}

          <Field label="Person">
            <Select
              disabled={isVacant}
              value={personId || (personName ? CREATE_PERSON : "")}
              onValueChange={(value) => {
                if (value === CREATE_PERSON) {
                  setPersonId("");
                  return;
                }
                setPersonId(value === NONE ? "" : value);
                const selected = people.find((item) => item.id === value);
                if (selected) setPersonName(selected.name);
              }}
            >
              <SelectTrigger><SelectValue placeholder="Choose a person" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {people.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                <SelectItem value={CREATE_PERSON}>Create a new person</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {!isVacant && !personId && (
            <Field label="New person name">
              <Input value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="Full name" />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reports to">
              <Select value={reportsToId} onValueChange={setReportsToId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value={NONE}>Top level</SelectItem>
                  {reportingOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.position_name || "Position"}{item.person_name ? ` · ${item.person_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Valid from">
              <Input type="date" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} />
            </Field>
          </div>

          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Manages</p>
                <p className="mt-1 text-xs text-muted-foreground">Automatically derived from who reports to this role.</p>
              </div>
              <Badge variant="secondary">{managedRoles.length}</Badge>
            </div>
            {managedRoles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {managedRoles.map((item) => (
                  <Badge key={item.id} variant="outline" className="font-normal">
                    {item.position_name || "Position"}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Field label="Valid to">
            <Input type="date" value={endedAt} onChange={(event) => setEndedAt(event.target.value)} />
            <span className="block text-xs text-muted-foreground">Leave empty while this assignment remains active.</span>
          </Field>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isVacant} onCheckedChange={(checked) => setIsVacant(checked === true)} />
              Role is vacant
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isPrimary} onCheckedChange={(checked) => setIsPrimary(checked === true)} />
              Primary leader of this organization
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : record ? "Save changes" : "Add role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
