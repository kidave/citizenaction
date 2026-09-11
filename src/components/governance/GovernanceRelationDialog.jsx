import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitBranch, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUpload from "@/components/media/ImageUpload";
import { getGovernanceLabel, getDefaultGovernanceUnitType, GOVERNANCE_ENTITY_TYPES, GOVERNANCE_UNIT_TYPES, GOVERNANCE_STATUS_OPTIONS } from "@/utils/governance";
import { supabase } from "@/lib/supabase/client";

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

export default function GovernanceRelationDialog({ open, onOpenChange, mode = "add-relation", sourceEntity, candidates = [], categories = [], children = [], onCompleted }) {
  const [step, setStep] = useState("relation");
  const [relationType, setRelationType] = useState("");
  const [existingId, setExistingId] = useState("");
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("unit");
  const [unitType, setUnitType] = useState("unit");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("active");
  const [validTo, setValidTo] = useState("");

  const isEdit = mode === "edit-relations";

  useEffect(() => {
    if (!open) return;
    setStep(isEdit ? "edit" : "relation");
    setRelationType("");
    setExistingId("");
    setName("");
    setEntityType("unit");
    setUnitType("unit");
    setCategoryId("");
    setImageUrl(null);
    setSaving(false);
    setValidFrom(new Date().toISOString().slice(0, 10));
    setStatus("active");
    setValidTo("");
  }, [open, isEdit]);

  useEffect(() => setUnitType(getDefaultGovernanceUnitType(entityType)), [entityType]);

  const filtered = useMemo(() => candidates.filter((item) => item.id !== sourceEntity?.id), [candidates, sourceEntity]);

  const chooseRelation = (type) => {
    setRelationType(type);
    setExistingId("");
    setStep("target");
  };

  const back = () => {
    if (step === "target" || step === "create") {
      setExistingId("");
      setStep("relation");
      return;
    }
    if (step === "existing") setStep("target");
  };

  const save = async () => {
    if (!sourceEntity?.id) return;
    try {
      setSaving(true);
      if (isEdit) {
        if (step === "edit-parent") {
          const result = await supabase.rpc("set_governance_parent", { p_child_id: sourceEntity.id, p_parent_id: existingId === "none" ? null : existingId });
          if (result?.error) throw result.error;
          toast.success("Parent relation updated");
        } else if (step === "edit-child") {
          const result = await supabase.rpc("set_governance_parent", { p_child_id: existingId, p_parent_id: null });
          if (result?.error) throw result.error;
          toast.success("Child relation removed");
        }
        await onCompleted?.();
        onOpenChange?.(false);
        return;
      }

      if (step === "existing") {
        if (!existingId) return toast.error("Choose an entity");
        const result = await supabase.rpc("set_governance_parent", {
          p_child_id: relationType === "parent-of" ? existingId : sourceEntity.id,
          p_parent_id: relationType === "parent-of" ? sourceEntity.id : existingId,
        });
        if (result?.error) throw result.error;
        toast.success("Governance relationship updated");
      } else if (step === "create") {
        if (!name.trim()) return toast.error("Name is required");
        if (!validFrom) return toast.error("Valid from is required");
        if (["inactive", "deprecated"].includes(status) && !validTo) return toast.error("Add Valid to when the entity becomes inactive");
        if (validTo && validTo < validFrom) return toast.error("Valid to cannot be earlier than valid from");
        const rpc = relationType === "parent-of" ? "add_governance_parent" : "add_governance_child";
        const payload = {
          p_name: name.trim(), p_entity_type: entityType, p_unit_type: unitType, p_status: status,
          p_valid_from: `${validFrom}T00:00:00Z`, p_valid_to: validTo ? `${validTo}T23:59:59.999Z` : null,
          p_category_id: categoryId || null, p_image_url: imageUrl || null,
        };
        payload[relationType === "parent-of" ? "p_child_id" : "p_parent_id"] = sourceEntity.id;
        const result = await supabase.rpc(rpc, payload);
        if (result?.error) throw result.error;
        toast.success("Governance relationship updated");
      } else return toast.error("Choose a relation");

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><GitBranch className="h-4 w-4" />{isEdit ? "Edit relations" : "Add relation"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm"><span className="font-medium">{getGovernanceLabel(sourceEntity)}</span><span className="mx-1 text-muted-foreground">·</span><span className="text-muted-foreground">{isEdit ? "manage reporting relationships" : "choose its relation"}</span></div>

          {isEdit ? (
            <>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Parent</div>
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <span className="min-w-0 flex-1 text-sm">{sourceEntity?.parent_id ? getGovernanceLabel(candidates.find((item) => item.id === sourceEntity.parent_id)) || "Current parent" : "No parent"}</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setExistingId(sourceEntity.parent_id || "none"); setStep("edit-parent"); }}>Change</Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Children</div>
                {children.length ? children.map((child) => (
                  <div key={child.id} className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="min-w-0 flex-1 truncate text-sm">{getGovernanceLabel(child)}</span>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={async () => { setExistingId(child.id); setStep("edit-child"); await save(); }} disabled={saving}><Trash2 className="mr-1.5 h-4 w-4" />Remove</Button>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No child relations.</p>}
              </div>
              {(step === "edit-parent" || step === "edit-child") && (
                <Field label={step === "edit-parent" ? "Parent" : "Child relation"}>
                  {step === "edit-parent" ? <Select value={existingId} onValueChange={setExistingId}><SelectTrigger><SelectValue placeholder="Choose a parent" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No parent — make independent</SelectItem>{filtered.map((item) => <SelectItem key={item.id} value={item.id}>{getGovernanceLabel(item)}</SelectItem>)}</SelectContent></Select> : <p className="text-sm text-muted-foreground">Remove this child from {getGovernanceLabel(sourceEntity)}?</p>}
                </Field>
              )}
            </>
          ) : step === "relation" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => chooseRelation("parent-of")}><div><div className="font-medium">Parent of</div><div className="mt-1 text-xs text-muted-foreground">Connect an entity that reports to this one.</div></div></Button>
              <Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => chooseRelation("child-of")}><div><div className="font-medium">Child of</div><div className="mt-1 text-xs text-muted-foreground">Connect this entity to the entity it reports to.</div></div></Button>
            </div>
          ) : step === "target" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("existing")}><div><div className="font-medium">Use an existing entity</div><div className="mt-1 text-xs text-muted-foreground">Connect a record already in Governance.</div></div></Button>
              <Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("create")}><div><div className="font-medium">Create a new entity</div><div className="mt-1 text-xs text-muted-foreground">Add a new record here.</div></div></Button>
            </div>
          ) : step === "existing" ? (
            <Field label={relationType === "parent-of" ? "Child entity" : "Parent entity"}><Select value={existingId} onValueChange={setExistingId}><SelectTrigger><SelectValue placeholder="Choose an entity" /></SelectTrigger><SelectContent className="max-h-72">{filtered.map((item) => <SelectItem key={item.id} value={item.id}>{getGovernanceLabel(item)}</SelectItem>)}</SelectContent></Select></Field>
          ) : (
            <div className="space-y-4">
              <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Western Railway" autoFocus /></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Entity type"><Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOVERNANCE_ENTITY_TYPES.map((type) => <SelectItem key={type} value={type}>{type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}</SelectItem>)}</SelectContent></Select></Field><Field label="Structural role"><Select value={unitType} onValueChange={setUnitType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOVERNANCE_UNIT_TYPES.map((type) => <SelectItem key={type} value={type}>{type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}</SelectItem>)}</SelectContent></Select></Field></div>
              <Field label="Category"><Select value={categoryId || "none"} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No category</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={validFrom} onChange={(event) => setValidFrom(event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={validTo} onChange={(event) => setValidTo(event.target.value)} /></Field></div>
              <Field label="Status"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOVERNANCE_STATUS_OPTIONS.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></Field>
              <ImageUpload bucket="governance" path={`governance/draft-${sourceEntity?.id || "entity"}/logo`} value={imageUrl} onChange={(value) => setImageUrl(value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
            </div>
          )}
        </div>

        <DialogFooter>
          {((!isEdit && step !== "relation") || (isEdit && step !== "edit")) && <Button type="button" variant="ghost" onClick={isEdit ? () => setStep("edit") : back} disabled={saving}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}
          {isEdit && step === "edit-parent" && <Button type="button" onClick={save} disabled={saving || !existingId}>{saving ? "Saving..." : "Save parent"}</Button>}
          {!isEdit && (step === "existing" || step === "create") && <Button type="button" onClick={save} disabled={saving || (step === "existing" && !existingId)}>{saving ? "Saving..." : step === "create" ? "Create relation" : "Save relation"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
