import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitBranch, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUpload from "@/components/media/ImageUpload";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceLabel } from "@/utils/governance";

const TYPES = ["authority", "unit", "position", "person", "organisation", "committee", "programme", "project", "ministry", "department", "division", "office", "ward", "station"];
const UNIT_TYPES = ["authority", "ministry", "department", "directorate", "division", "zone", "ward", "region", "office", "branch", "station", "court", "bench", "committee", "board", "commission", "unit", "other"];
const STATUS_OPTIONS = [["active", "Active"], ["inactive", "Inactive"], ["deprecated", "Deprecated"]];
function formatType(value) { if (!value) return "Governance"; if (value === "other") return "Organisation"; return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
function defaultUnitType(entityType) { const map = { authority: "authority", ministry: "ministry", department: "department", division: "division", office: "office", ward: "ward", station: "station" }; return map[entityType] || "unit"; }
function wouldCreateCycle(sourceId, targetId, records) { if (!sourceId || !targetId || sourceId === targetId) return true; const byId = new Map(records.map((record) => [record.id, record])); let current = byId.get(targetId); const seen = new Set(); while (current?.parent_id && !seen.has(current.id)) { if (current.parent_id === sourceId) return true; seen.add(current.id); current = byId.get(current.parent_id); } return false; }
function Field({ label, children }) { return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>; }

export default function GovernanceRelationDialog({ open, onOpenChange, mode = "add-child", sourceEntity, candidates = [], categories = [], locations = [], onCompleted }) {
  const [step, setStep] = useState("choose");
  const [existingId, setExistingId] = useState("");
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("unit");
  const [unitType, setUnitType] = useState("unit");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("active");
  const [validTo, setValidTo] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("choose"); setExistingId(""); setName(""); setEntityType("unit"); setUnitType("unit"); setCategoryId(""); setLocationId(""); setImageUrl(null); setSaving(false);
      setValidFrom(new Date().toISOString().slice(0, 10)); setStatus("active"); setValidTo("");
    }
  }, [open]);
  useEffect(() => { setUnitType(defaultUnitType(entityType)); }, [entityType]);

  const filtered = useMemo(() => candidates.filter((item) => item.id !== sourceEntity?.id), [candidates, sourceEntity]);
  const title = mode === "add-child" ? "Add child" : mode === "add-parent" ? "Add parent" : "Change parent";

  const save = async () => {
    if (!sourceEntity?.id) return;
    try {
      setSaving(true);
      if (mode === "change-parent") {
        if (!existingId) return toast.error("Choose a new parent");
        if (wouldCreateCycle(sourceEntity.id, existingId, candidates)) return toast.error("That relationship would create a cycle");
        const { error } = await supabase.from("governance_unit").update({ parent_entity_id: existingId }).eq("entity_id", sourceEntity.id);
        if (error) throw error;
        toast.success("Parent updated");
        await onCompleted?.();
        onOpenChange?.(false);
        return;
      }

      if (step === "choose") { setStep("existing"); return; }
      if (step === "existing") {
        if (!existingId) return toast.error(`Choose an existing ${mode === "add-child" ? "child" : "parent"}`);
        const parentId = mode === "add-child" ? sourceEntity.id : existingId;
        const childId = mode === "add-child" ? existingId : sourceEntity.id;
        if (wouldCreateCycle(sourceEntity.id, existingId, candidates)) return toast.error("That relationship would create a cycle");
        if (mode === "add-parent" && wouldCreateCycle(existingId, sourceEntity.id, candidates)) return toast.error("That relationship would create a cycle");
        const { error } = await supabase.from("governance_unit").update({ parent_entity_id: parentId }).eq("entity_id", childId);
        if (error) throw error;
        toast.success("Governance relationship updated");
        await onCompleted?.();
        onOpenChange?.(false);
        return;
      }

      if (!name.trim()) return toast.error("Name is required");
      if (!validFrom) return toast.error("Valid from is required");
      if ((status === "inactive" || status === "deprecated") && !validTo) return toast.error("Add Valid to when the entity becomes inactive");
      if (validTo && validTo < validFrom) return toast.error("Valid to cannot be earlier than Valid from");

      const { data: governance, error: governanceError } = await supabase.from("governance").insert({
        name: name.trim(), entity_type: entityType, status, valid_from: `${validFrom}T00:00:00Z`,
        valid_to: (status === "inactive" || status === "deprecated") && validTo ? `${validTo}T23:59:59.999Z` : null,
        category_id: categoryId || null, location_id: locationId ? Number(locationId) : null, image_url: imageUrl || null,
      }).select("*").single();
      if (governanceError) throw governanceError;

      const parentId = mode === "add-child" ? sourceEntity.id : null;
      const { error: unitError } = await supabase.from("governance_unit").insert({
        entity_id: governance.id, parent_entity_id: parentId, unit_type: unitType, name: name.trim(),
        valid_from: `${validFrom}T00:00:00Z`, valid_to: (status === "inactive" || status === "deprecated") && validTo ? `${validTo}T23:59:59.999Z` : null,
      });
      if (unitError) {
        await supabase.from("governance").delete().eq("id", governance.id);
        throw unitError;
      }

      if (mode === "add-parent") {
        const { error: attachError } = await supabase.from("governance_unit").update({ parent_entity_id: governance.id }).eq("entity_id", sourceEntity.id);
        if (attachError) {
          await supabase.from("governance").delete().eq("id", governance.id);
          throw attachError;
        }
      }

      toast.success(mode === "add-parent" ? "Parent added" : "Child added");
      await onCompleted?.();
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to update governance relationship");
    } finally {
      setSaving(false);
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2"><GitBranch className="h-4 w-4" />{title}</DialogTitle></DialogHeader><div className="space-y-4 py-2"><div className="rounded-lg border bg-muted/30 p-3 text-sm"><span className="font-medium">{getGovernanceLabel(sourceEntity)}</span><span className="mx-1 text-muted-foreground">·</span><span className="text-muted-foreground">{mode === "add-child" ? "parent of" : mode === "add-parent" ? "child of" : "new parent for"}</span></div>
    {mode === "change-parent" ? <Field label="New parent"><Select value={existingId} onValueChange={setExistingId}><SelectTrigger><SelectValue placeholder="Choose a governance entity" /></SelectTrigger><SelectContent className="max-h-72">{filtered.map((item) => <SelectItem key={item.id} value={item.id}>{getGovernanceLabel(item)}</SelectItem>)}</SelectContent></Select></Field> : step === "choose" ? <div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("existing")}><div><div className="font-medium">Use an existing entity</div><div className="mt-1 text-xs text-muted-foreground">Connect a record already in Governance.</div></div></Button><Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("create")}><div><div className="font-medium">Create a new entity</div><div className="mt-1 text-xs text-muted-foreground">Add a new record here.</div></div></Button></div> : step === "existing" ? <Field label={mode === "add-child" ? "Child entity" : "Parent entity"}><Select value={existingId} onValueChange={setExistingId}><SelectTrigger><SelectValue placeholder="Choose an entity" /></SelectTrigger><SelectContent className="max-h-72">{filtered.map((item) => <SelectItem key={item.id} value={item.id}>{getGovernanceLabel(item)} · {formatType(item.entity_type)}</SelectItem>)}</SelectContent></Select></Field> : <div className="space-y-4"><Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Western Railway" autoFocus /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Entity type"><Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{formatType(type)}</SelectItem>)}</SelectContent></Select></Field><Field label="Structural role"><Select value={unitType} onValueChange={setUnitType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNIT_TYPES.map((type) => <SelectItem key={type} value={type}>{formatType(type)}</SelectItem>)}</SelectContent></Select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><Select value={categoryId || "none"} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}><SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No category</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field><Field label="Location"><Select value={locationId || "none"} onValueChange={(v) => setLocationId(v === "none" ? "" : v)}><SelectTrigger><SelectValue placeholder="Choose a location" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No location</SelectItem>{locations.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} /></Field><Field label="Valid to"><Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} disabled={status === "active"} /></Field></div><Field label="Status"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(([v,t]) => <SelectItem key={v} value={v}>{t}</SelectItem>)}</SelectContent></Select></Field><p className="text-xs text-muted-foreground">{status === "active" ? "Leave Valid to empty while this entity remains active." : "Enter the date this entity closed or was retired."}</p><ImageUpload bucket="governance" path={`governance/new-${sourceEntity?.id || "entity"}/logo`} value={imageUrl} onChange={(value) => setImageUrl(value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} /></div>}
  </div><DialogFooter>{step !== "choose" && mode !== "change-parent" && <Button type="button" variant="ghost" onClick={() => setStep("choose")} disabled={saving}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}<Button type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : mode === "add-child" ? <><Plus className="mr-2 h-4 w-4" />Add child</> : mode === "add-parent" ? <><Plus className="mr-2 h-4 w-4" />Add parent</> : "Change parent"}</Button></DialogFooter></DialogContent></Dialog>;
}
