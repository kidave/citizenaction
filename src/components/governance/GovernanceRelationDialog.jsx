import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitBranch, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ImageUpload from "@/components/media/ImageUpload";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { GOVERNANCE_TYPES, GOVERNANCE_STATUS_OPTIONS, formatGovernanceType, getGovernanceLabel } from "@/utils/governance";
import { supabase } from "@/lib/supabase/client";

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

export default function GovernanceRelationDialog({ open, onOpenChange, mode = "add-relation", sourceEntity, candidates = [], categories = [], childEntities = [], onCompleted }) {
  const [step, setStep] = useState("relation");
  const [relationType, setRelationType] = useState("");
  const [existingId, setExistingId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("organization");
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
    setType("organization");
    setCategoryId("");
    setImageUrl(null);
    setSaving(false);
    setValidFrom(new Date().toISOString().slice(0, 10));
    setStatus("active");
    setValidTo("");
  }, [open, isEdit]);

  const filtered = useMemo(() => candidates.filter((item) => item.id !== sourceEntity?.id), [candidates, sourceEntity]);
  const candidateOptions = useMemo(() => filtered.map((item) => ({
    value: item.id,
    label: getGovernanceLabel(item),
    searchValue: `${item.name || ""} ${item.short_name || ""}`,
  })), [filtered]);

  const chooseRelation = (relation) => { setRelationType(relation); setExistingId(""); setStep("target"); };
  const back = () => { if (step === "target" || step === "create") { setExistingId(""); setStep("relation"); } else if (step === "existing") setStep("target"); };

  const removeChild = async (childId) => {
    try {
      setSaving(true);
      const result = await supabase.rpc("set_governance_parent", { p_child_id: childId, p_parent_id: null });
      if (result?.error) throw result.error;
      toast.success("Child relation removed");
      await onCompleted?.();
    } catch (error) {
      toast.error(error?.message || "Unable to remove child relation");
    } finally { setSaving(false); }
  };

  const save = async () => {
    if (!sourceEntity?.id) return;
    try {
      setSaving(true);

      if (isEdit && step === "edit-parent") {
        const result = await supabase.rpc("set_governance_parent", { p_child_id: sourceEntity.id, p_parent_id: existingId === "none" ? null : existingId });
        if (result?.error) throw result.error;
        toast.success("Parent relation updated");
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
        if (!type) return toast.error("Governance type is required");
        if (!validFrom) return toast.error("Valid from is required");
        if (["inactive", "deprecated"].includes(status) && !validTo) return toast.error("Add Valid to when the entity becomes inactive");
        if (validTo && validTo < validFrom) return toast.error("Valid to cannot be earlier than valid from");

        const created = await supabase.rpc("create_governance_entity", {
          p_name: name.trim(),
          p_type: type,
          p_short_name: null,
          p_status: status,
          p_valid_from: `${validFrom}T00:00:00Z`,
          p_valid_to: validTo ? `${validTo}T23:59:59.999Z` : null,
          p_category_id: categoryId || null,
          p_image_url: imageUrl || null,
        });
        if (created?.error) throw created.error;
        const createdId = Array.isArray(created?.data) ? created.data[0]?.id : created?.data?.id;
        if (!createdId) throw new Error("Unable to create governance entity");

        const parentResult = await supabase.rpc("set_governance_parent", {
          p_child_id: relationType === "parent-of" ? createdId : sourceEntity.id,
          p_parent_id: relationType === "parent-of" ? sourceEntity.id : createdId,
        });
        if (parentResult?.error) throw parentResult.error;
        toast.success("Governance relationship updated");
      } else {
        return toast.error("Choose a relation");
      }

      await onCompleted?.();
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to update governance relationship");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl">
        <SheetHeader className="border-b px-5 py-4 text-left sm:px-6">
          <SheetTitle className="flex items-center gap-2"><GitBranch className="h-4 w-4" />{isEdit ? "Edit relations" : "Add relation"}</SheetTitle>
          <div className="text-sm text-muted-foreground">{getGovernanceLabel(sourceEntity)}</div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mx-auto w-full max-w-xl space-y-5">
            {isEdit ? (
              <>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm"><span className="font-medium">{getGovernanceLabel(sourceEntity)}</span><span className="mx-1 text-muted-foreground">·</span><span className="text-muted-foreground">manage reporting relationships</span></div>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Parent</div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="min-w-0 flex-1 truncate text-sm">{sourceEntity?.parent_id ? getGovernanceLabel(filtered.find((item) => item.id === sourceEntity.parent_id)) || "Current parent" : "No parent"}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => { setExistingId(sourceEntity.parent_id || "none"); setStep("edit-parent"); }}>Change</Button>
                  </div>
                  {step === "edit-parent" && <div className="pt-2"><Field label="New parent"><SearchableSelect value={existingId} onValueChange={setExistingId} options={[{ value: "none", label: "No parent — make independent", searchValue: "no parent independent" }, ...candidateOptions]} placeholder="Choose a parent" searchPlaceholder="Search organizations..." emptyText="No organizations found." /></Field></div>}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Children</div>
                  {childEntities.length ? childEntities.map((child) => <div key={child.id} className="flex items-center gap-2 rounded-lg border p-3"><span className="min-w-0 flex-1 truncate text-sm">{getGovernanceLabel(child)}</span><Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeChild(child.id)} disabled={saving}><Trash2 className="mr-1.5 h-4 w-4" />Remove</Button></div>) : <p className="text-sm text-muted-foreground">No child relations.</p>}
                </div>
              </>
            ) : step === "relation" ? (
              <div className="space-y-3"><p className="text-sm text-muted-foreground">How should the new relation connect to this entity?</p><div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => chooseRelation("parent-of")}><div><div className="font-medium">Parent of</div><div className="mt-1 text-xs text-muted-foreground">Connect an entity that reports to this one.</div></div></Button><Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => chooseRelation("child-of")}><div><div className="font-medium">Child of</div><div className="mt-1 text-xs text-muted-foreground">Connect this entity to the entity it reports to.</div></div></Button></div></div>
            ) : step === "target" ? (
              <div className="space-y-3"><p className="text-sm text-muted-foreground">Choose how you want to add the connected entity.</p><div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("existing")}><div><div className="font-medium">Use an existing entity</div><div className="mt-1 text-xs text-muted-foreground">Connect a record already in Governance.</div></div></Button><Button type="button" variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setStep("create")}><div><div className="font-medium">Create a new entity</div><div className="mt-1 text-xs text-muted-foreground">Add a new record here.</div></div></Button></div></div>
            ) : step === "existing" ? (
              <Field label={relationType === "parent-of" ? "Child entity" : "Parent entity"}><SearchableSelect value={existingId} onValueChange={setExistingId} options={candidateOptions} placeholder="Choose an organization" searchPlaceholder="Search organizations..." emptyText="No organizations found." /></Field>
            ) : (
              <div className="space-y-4">
                <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Western Railway" autoFocus /></Field>
                <Field label="Governance type"><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="max-h-72">{GOVERNANCE_TYPES.map((item) => <SelectItem key={item} value={item}>{formatGovernanceType(item)}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Category"><Select value={categoryId || "none"} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="none">No category</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field>
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Valid from"><Input type="date" value={validFrom} onChange={(event) => setValidFrom(event.target.value)} /></Field><Field label="Valid to"><Input type="date" value={validTo} onChange={(event) => setValidTo(event.target.value)} /></Field></div>
                <Field label="Status"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOVERNANCE_STATUS_OPTIONS.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></Field>
                <ImageUpload bucket="governance" path={`governance/draft-${sourceEntity?.id || "entity"}/logo`} value={imageUrl} onChange={(value) => setImageUrl(value || null)} label="Logo" helperText="PNG, JPG or WebP · up to 5 MB" disabled={saving} />
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="border-t bg-background px-5 py-4 sm:px-6">
          {((!isEdit && step !== "relation") || (isEdit && step !== "edit")) && <Button type="button" variant="ghost" onClick={isEdit ? () => setStep("edit") : back} disabled={saving}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}
          {isEdit && step === "edit-parent" && <Button type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save parent"}</Button>}
          {!isEdit && (step === "existing" || step === "create") && <Button type="button" onClick={save} disabled={saving || (step === "existing" && !existingId)}>{saving ? "Saving..." : step === "create" ? "Create relation" : "Save relation"}</Button>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
