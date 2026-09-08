import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitBranch, Link2, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGovernance } from "@/hooks/governance/useGovernance";
import { useGovernanceContribution } from "@/hooks/governance/useGovernanceContribution";

const TYPES = [
  ["authority", "Authority"],
  ["organisation", "Organisation"],
  ["unit", "Unit"],
  ["ministry", "Ministry"],
  ["department", "Department"],
  ["committee", "Committee"],
  ["office", "Office"],
  ["division", "Division"],
  ["ward", "Ward"],
  ["station", "Station"],
  ["person", "Person"],
  ["position", "Position"],
  ["programme", "Programme"],
  ["project", "Project"],
];

const ACTIONS = [
  { value: "add", label: "Add something", description: "Add a missing governance entity to the tree.", icon: Plus },
  { value: "edit", label: "Correct information", description: "Fix something about an existing entity.", icon: Pencil },
  { value: "move", label: "Change its place", description: "Move an entity under a different parent.", icon: GitBranch },
  { value: "delete", label: "Request removal", description: "Tell us why an entity should no longer appear.", icon: Trash2 },
];

function typeLabel(type) {
  return TYPES.find(([value]) => value === type)?.[1] || "Governance";
}

export default function GovernanceContributionDialog({ open, onOpenChange, record = null, defaultParentId = null }) {
  const forcedAction = record?.__suggestAction || null;
  const [step, setStep] = useState(forcedAction || (record ? "edit" : "action"));
  const [action, setAction] = useState(forcedAction || (record ? "edit" : "add"));
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("organisation");
  const [parentId, setParentId] = useState(defaultParentId || null);
  const [summary, setSummary] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [suggestedValue, setSuggestedValue] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!open) return;
    const nextAction = forcedAction || (record ? "edit" : "add");
    setAction(nextAction);
    setStep(forcedAction || (record ? "edit" : "action"));
    setName(record?.name || "");
    setEntityType(record?.entity_type || "organisation");
    setParentId(record?.parent_id || defaultParentId || null);
    setSummary("");
    setSelectedField("");
    setSuggestedValue("");
    setSourceUrl("");
    setSourceNotes("");
    setShowMore(false);
  }, [open, record, defaultParentId, forcedAction]);

  const { data: parentOptions = [] } = useGovernance({
    search: "",
    entityType: "all",
    includeAll: true,
    enabled: open,
  });
  const { submitContribution, isSubmitting } = useGovernanceContribution();

  const selectedParent = useMemo(
    () => parentOptions.find((item) => item.id === parentId) || null,
    [parentOptions, parentId],
  );

  const chooseAction = (value) => {
    setAction(value);
    setStep(value);
  };

  async function submit() {
    if (action === "add" && !name.trim()) throw new Error("Please enter a name");
    if (action === "edit" && !selectedField) throw new Error("Please choose what needs changing");
    if (!summary.trim()) throw new Error("Please tell us what should change");

    const proposedChanges = {};
    if (action === "add") {
      proposedChanges.name = name.trim();
      proposedChanges.entity_type = entityType;
    }
    if (action === "edit" && suggestedValue.trim()) proposedChanges[selectedField] = suggestedValue.trim();

    await submitContribution({
      summary: summary.trim(),
      action,
      proposedGovernanceId: record?.id || null,
      proposedParentId: action === "move" || action === "add" ? parentId || null : null,
      proposedEntityType: action === "add" ? entityType : null,
      proposedChanges,
      sourceUrl: sourceUrl.trim() || null,
      sourceNotes: sourceNotes.trim() || null,
    });

    onOpenChange(false);
  }

  const title = record
    ? action === "move"
      ? `Change where ${record.name || "this entity"} sits`
      : action === "delete"
        ? "Request removal"
        : "Suggest an edit"
    : "Help improve Governance";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {record
              ? "Make one simple suggestion about this governance entity. An administrator will review it."
              : "You don't need to fill out a form. Just tell us what you'd like to change in the governance tree."}
          </DialogDescription>
        </DialogHeader>

        {step === "action" && (
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">What would you like to do?</h3>
              <p className="mt-1 text-xs text-muted-foreground">Choose the option that best matches your suggestion.</p>
            </div>
            <div className="grid gap-2">
              {ACTIONS.map(({ value, label, description, icon: Icon }) => (
                <button key={value} type="button" onClick={() => chooseAction(value)} className="rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className="block text-sm font-medium">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{description}</span></span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "add" && (
          <section className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">Add to the governance tree</p>
              {selectedParent && <p className="mt-1 text-xs text-muted-foreground">This will be placed under <span className="font-medium text-foreground">{selectedParent.name}</span>.</p>}
            </div>
            <div className="space-y-2"><Label htmlFor="governance-name">What is it called?</Label><Input id="governance-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Western Railway" autoFocus /></div>
            <div className="space-y-2"><Label>What is it?</Label><Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue placeholder="Choose a type" /></SelectTrigger><SelectContent>{TYPES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="governance-add-summary">Tell us a little more</Label><Textarea id="governance-add-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Why should this entity be added?" /></div>
          </section>
        )}

        {step === "edit" && (
          <section className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-3"><p className="text-sm font-medium">{record?.name}</p><p className="mt-1 text-xs text-muted-foreground">What looks wrong?</p></div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[["name", "Name"], ["short_name", "Short name"], ["description", "Description"], ["website", "Website"], ["image_url", "Logo"], ["entity_type", "Type"]].map(([value, label]) => <button key={value} type="button" onClick={() => setSelectedField(value)} className={`rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${selectedField === value ? "border-primary bg-primary/5" : ""}`}>{label}</button>)}
            </div>
            {selectedField && selectedField !== "image_url" && <div className="space-y-2"><Label htmlFor="governance-suggested-value">What should it say instead?</Label><Textarea id="governance-suggested-value" value={suggestedValue} onChange={(e) => setSuggestedValue(e.target.value)} placeholder={selectedField === "description" ? "Describe the correct information..." : "Enter the correct information"} autoFocus /></div>}
            {selectedField === "image_url" && <p className="rounded-md bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">Tell us in the explanation what the correct logo should be or provide an official source below.</p>}
            <div className="space-y-2"><Label htmlFor="governance-edit-summary">What should we change?</Label><Textarea id="governance-edit-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Explain the correction in your own words." /></div>
          </section>
        )}

        {step === "move" && (
          <section className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-3"><p className="text-sm font-medium">Move {record?.name}</p><p className="mt-1 text-xs text-muted-foreground">Choose where this entity should sit in the tree.</p></div>
            <div className="space-y-2"><Label>New parent</Label><Select value={parentId || "root"} onValueChange={(value) => setParentId(value === "root" ? null : value)}><SelectTrigger><SelectValue placeholder="Choose parent" /></SelectTrigger><SelectContent><SelectItem value="root">Top level — no parent</SelectItem>{parentOptions.filter((item) => item.id !== record?.id).map((item) => <SelectItem key={item.id} value={item.id}>{item.name || item.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">{selectedParent ? `Move it under ${selectedParent.name}.` : "Move it to the top level."}</div>
            <div className="space-y-2"><Label htmlFor="governance-move-summary">Why should it move?</Label><Textarea id="governance-move-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Explain why the hierarchy should change." /></div>
          </section>
        )}

        {step === "delete" && (
          <section className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-3"><p className="text-sm font-medium">Request removal of {record?.name}</p><p className="mt-1 text-xs text-muted-foreground">We'll review the record before removing anything.</p></div>
            <div className="space-y-2"><Label htmlFor="governance-delete-summary">Why should it be removed?</Label><Textarea id="governance-delete-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Tell us what is incorrect or no longer valid." autoFocus /></div>
          </section>
        )}

        {step !== "action" && (
          <section className="space-y-2">
            <Button type="button" variant="ghost" className="px-0 text-sm" onClick={() => setShowMore((value) => !value)}><Link2 className="mr-2 h-4 w-4" />{showMore ? "Hide source details" : "Add a source (optional)"}</Button>
            {showMore && <div className="space-y-3 rounded-lg border bg-muted/10 p-4"><div className="space-y-2"><Label htmlFor="governance-source">Source URL</Label><Input id="governance-source" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="Official government page or document" /></div><div className="space-y-2"><Label htmlFor="governance-source-notes">Source note</Label><Textarea id="governance-source-notes" value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} placeholder="Anything useful about the source" /></div></div>}
          </section>
        )}

        <DialogFooter className="gap-2">
          {step !== "action" && !record && <Button type="button" variant="ghost" onClick={() => setStep("action")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step !== "action" && <Button type="button" disabled={isSubmitting} onClick={async () => { try { await submit(); } catch { /* mutation hook reports the server error */ } }}>{isSubmitting ? "Sending..." : "Send suggestion"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
