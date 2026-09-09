import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitBranch, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceLabel } from "@/utils/governance";

const TYPES = [
  "authority", "unit", "position", "person", "organisation", "committee", "programme", "project",
  "ministry", "department", "division", "office", "ward", "station",
];

function formatType(value) {
  if (!value) return "Governance";
  if (value === "other") return "Organisation";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function wouldCreateCycle(sourceId, targetId, records) {
  if (!sourceId || !targetId || sourceId === targetId) return true;
  const byId = new Map(records.map((record) => [record.id, record]));
  let current = byId.get(targetId);
  const seen = new Set();
  while (current?.parent_id && !seen.has(current.id)) {
    if (current.parent_id === sourceId) return true;
    seen.add(current.id);
    current = byId.get(current.parent_id);
  }
  return false;
}

export default function GovernanceRelationDialog({
  open,
  onOpenChange,
  mode = "add-child",
  sourceEntity,
  candidates = [],
  onCompleted,
}) {
  const [step, setStep] = useState("choose");
  const [existingId, setExistingId] = useState("");
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("unit");
  const [unitType, setUnitType] = useState("unit");
  const [saving, setSaving] = useState(false);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("active");
  const [validTo, setValidTo] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("choose"); setExistingId(""); setName(""); setEntityType("unit"); setUnitType("unit"); setSaving(false);
      setValidFrom(new Date().toISOString().slice(0, 10)); setStatus("active"); setValidTo("");
    }
  }, [open]);

  const filtered = useMemo(() => candidates.filter((item) => item.id !== sourceEntity?.id), [candidates, sourceEntity]);
  const title = mode === "add-child" ? "Add child" : mode === "add-parent" ? "Add parent" : "Change parent";
  const relationText = mode === "add-child" ? "child of" : mode === "add-parent" ? "parent of" : "new parent for";

  const save = async () => {
    if (!sourceEntity?.id) return;
    try {
      setSaving(true);
      let parentId = null;
      let childId = null;

      if (mode === "change-parent") {
        if (!existingId) return toast.error("Choose a new parent");
        if (wouldCreateCycle(sourceEntity.id, existingId, candidates)) return toast.error("That relationship would create a cycle");
        parentId = existingId; childId = sourceEntity.id;
      } else if (step === "choose") {
        setStep("existing");
        return;
      } else if (step === "existing") {
        if (!existingId) return toast.error(`Choose an existing ${mode === "add-child" ? "child" : "parent"}`);
        if (mode === "add-child") {
          if (wouldCreateCycle(sourceEntity.id, existingId, candidates)) return toast.error("That relationship would create a cycle");
          parentId = sourceEntity.id; childId = existingId;
        } else {
          if (wouldCreateCycle(existingId, sourceEntity.id, candidates)) return toast.error("That relationship would create a cycle");
          parentId = existingId; childId = sourceEntity.id;
        }
      } else {
        if (!name.trim()) return toast.error("Name is required");
        if (!validFrom) return toast.error("Valid from is required");
        if ((status === "inactive" || status === "deprecated") && !validTo) return toast.error("Add Valid to when the entity becomes inactive");
        if (validTo && validTo < validFrom) return toast.error("Valid to cannot be earlier than Valid from");

        const { data: governance, error: governanceError } = await supabase.from("governance").insert({
          name: name.trim(), entity_type: entityType, status, valid_from: `${validFrom}T00:00:00Z`,
          valid_to: validTo ? `${validTo}T23:59:59.999Z` : null,
        }).select("*").single();
        if (governanceError) throw governanceError;

        const { error: unitError } = await supabase.from("governance_unit").insert({
          entity_id: governance.id, parent_entity_id: mode === "add-child" ? sourceEntity.id : null,
          unit_type: unitType, name: name.trim(), valid_from: `${validFrom}T00:00:00Z`,
          valid_to: validTo ? `${validTo}T23:59:59.999Z` : null,
        });
        if (unitError) {
          await supabase.from("governance").delete().eq("id", governance.id);
          throw unitError;
        }
        toast.success("Governance entity added");
        await onCompleted?.();
        onOpenChange?.(false);
        return;
      }

      const { error } = await supabase.from("governance_unit").update({ parent_entity_id: parentId }).eq("entity_id", childId);
      if (error) throw error;
      toast.success(mode === "change-parent" ? "Parent updated" : "Governance relationship updated");
      await onCompleted?.();
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to update governance relationship");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><GitBranch className="h-4 w-4" />{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm"><span className="font-medium">{getGovernanceLabel(sourceEntity)}</span><span className="mx-1 text-muted-foreground">·</span><span className="text-muted-foreground">{relationText}</span></div>

          {mode === "change-parent" ? (
            <div className="space-y-2"><Label>New parent</Label><Select value={existingId} onValueChange={setExistingId}><SelectTrigger><SelectValue placeholder="Choose a governance entity" /></SelectTrigger><SelectContent className="max-h-72">{filtered.map((item) => <SelectItem key={item.id} value={item.id}>{getGovernanceLabel(item)}</SelectItem>)}</SelectContent></Select></div>
          ) : step === "choose" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("existing")}><div><div className="font-medium">Use an existing entity</div><div className="mt-1 text-xs text-muted-foreground">Connect a record already in Governance.</div></div></Button>
              <Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("create")}><div><div className="font-medium">Create a new entity</div><div className="mt-1 text-xs text-muted-foreground">Add a new record here.</div></div></Button>
            </div>
          ) : step === "existing" ? (
            <div className="space-y-2"><Label>{mode === "add-child" ? "Child entity" : "Parent entity"}</Label><Select value={existingId} onValueChange={setExistingId}><SelectTrigger><SelectValue placeholder="Choose an entity" /></SelectTrigger><SelectContent className="max-h-72">{filtered.map((item) => <SelectItem key={item.id} value={item.id}>{getGovernanceLabel(item)} · {formatType(item.entity_type)}</SelectItem>)}</SelectContent></Select></div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Western Railway" autoFocus /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Entity type</Label><Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{formatType(type)}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Unit type</Label><Select value={unitType} onValueChange={setUnitType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{formatType(type)}</SelectItem>)}</SelectContent></Select></div></div>
              <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Valid from</Label><Input type="date" value={validFrom} onChange={(event) => setValidFrom(event.target.value)} /></div><div className="space-y-2"><Label>Valid to</Label><Input type="date" value={validTo} onChange={(event) => setValidTo(event.target.value)} disabled={status === "active"} /></div></div>
              <div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="deprecated">Deprecated</SelectItem></SelectContent></Select></div>
            </div>
          )}
        </div>
        <DialogFooter>
          {step !== "choose" && mode !== "change-parent" && <Button type="button" variant="ghost" onClick={() => setStep("choose")} disabled={saving}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}
          <Button type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : mode === "add-child" ? <><Plus className="mr-2 h-4 w-4" />Add child</> : mode === "add-parent" ? <><Plus className="mr-2 h-4 w-4" />Add parent</> : "Change parent"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
