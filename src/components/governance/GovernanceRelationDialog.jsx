import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitBranch, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ImageUpload from "@/components/ui/ImageUpload";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import {
  GOVERNANCE_TYPES,
  GOVERNANCE_STATUS_OPTIONS,
  formatGovernanceType,
  getGovernanceLabel,
} from "@/utils/governance";
import { supabase } from "@/lib/supabase/client";

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function GovernanceRelationDialog({
  open,
  onOpenChange,
  mode = "add-relation",
  sourceEntity,
  categories = [],
  childEntities = [],
  onCompleted,
}) {
  const [step, setStep] = useState("relation");
  const [relationType, setRelationType] = useState("");
  const [existingId, setExistingId] = useState("");
  const [existingIds, setExistingIds] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("organization");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState("active");
  const [validTo, setValidTo] = useState("");
  const [activeMode, setActiveMode] = useState(mode);
  const [selectedParent, setSelectedParent] = useState(null);
  const isEdit = activeMode === "edit-relations";

  useEffect(() => {
    if (!open) return;
    setActiveMode(mode);
    if (mode === "edit-relations") {
      setStep("edit");
      setRelationType("");
    } else if (mode === "add-parent") {
      setStep("existing");
      setRelationType("child-of");
    } else if (mode === "add-child") {
      setStep("existing");
      setRelationType("parent-of");
    } else {
      setStep("relation");
      setRelationType("");
    }
    setExistingId("");
    setExistingIds([]);
    setName("");
    setType("organization");
    setCategoryId("");
    setImageUrl(null);
    setSaving(false);
    setValidFrom(new Date().toISOString().slice(0, 10));
    setStatus("active");
    setValidTo("");
    setSelectedParent(null);
  }, [open, isEdit]);

  const removeParent = async () => {
    if (!sourceEntity?.id || !currentParent) return;
    try {
      setSaving(true);
      const result = await supabase.rpc("set_governance_parent", {
        p_child_id: sourceEntity.id,
        p_parent_id: null,
      });
      if (result?.error) throw result.error;
      toast.success("Parent relation removed");
      await onCompleted?.();
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to remove parent relation");
    } finally {
      setSaving(false);
    }
  };

  const currentParent = useMemo(
    () =>
      sourceEntity?.parent_id
        ? {
            id: sourceEntity.parent_id,
            name: sourceEntity.parent_name,
            short_name: sourceEntity.parent_short_name,
            slug: sourceEntity.parent_slug,
          }
        : null,
    [sourceEntity],
  );
  const back = () => {
    if (step === "edit-parent") {
      setStep("edit");
      setExistingId("");
      setSelectedParent(null);
      return;
    }
    if (!isEdit) onOpenChange?.(false);
  };

  const removeChild = async (childId) => {
    try {
      setSaving(true);
      const result = await supabase.rpc("set_governance_parent", {
        p_child_id: childId,
        p_parent_id: null,
      });
      if (result?.error) throw result.error;
      toast.success("Child relation removed");
      await onCompleted?.();
    } catch (error) {
      toast.error(error?.message || "Unable to remove child relation");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!sourceEntity?.id) return;
    try {
      setSaving(true);

      if (isEdit && step === "edit-parent") {
        const result = await supabase.rpc("set_governance_parent", {
          p_child_id: sourceEntity.id,
          p_parent_id: existingId === "none" ? null : existingId,
        });
        if (result?.error) throw result.error;
        toast.success("Parent relation updated");
        await onCompleted?.();
        onOpenChange?.(false);
        return;
      }

      if (step === "existing") {
        const targetIds =
          relationType === "parent-of"
            ? existingIds
            : existingId
              ? [existingId]
              : [];

        if (!targetIds.length) return toast.error("Choose an organization");

        const results = await Promise.all(
          targetIds.map((targetId) =>
            supabase.rpc("set_governance_parent", {
              p_child_id:
                relationType === "parent-of" ? targetId : sourceEntity.id,
              p_parent_id:
                relationType === "parent-of" ? sourceEntity.id : targetId,
            }),
          ),
        );

        const failed = results.find((result) => result?.error);
        if (failed?.error) throw failed.error;

        toast.success(
          targetIds.length > 1
            ? "Governance relationships updated"
            : "Governance relationship updated",
        );
      } else if (step === "create") {
        if (!name.trim()) return toast.error("Name is required");
        if (!type) return toast.error("Governance type is required");
        if (!validFrom) return toast.error("Valid from is required");
        if (["inactive", "deprecated"].includes(status) && !validTo)
          return toast.error("Add Valid to when the entity becomes inactive");
        if (validTo && validTo < validFrom)
          return toast.error("Valid to cannot be earlier than valid from");

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
        const createdId = Array.isArray(created?.data)
          ? created.data[0]?.id
          : created?.data?.id;
        if (!createdId) throw new Error("Unable to create governance entity");

        const parentResult = await supabase.rpc("set_governance_parent", {
          p_child_id:
            relationType === "parent-of" ? createdId : sourceEntity.id,
          p_parent_id:
            relationType === "parent-of" ? sourceEntity.id : createdId,
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

  const selectionMode = relationType === "child-of" ? "radio" : "checkbox";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-3xl"
      >
        <SheetHeader className="border-b px-5 py-4 text-left sm:px-6">
          <SheetTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {isEdit ? "Edit relations" : activeMode === "add-parent" ? "Add parent" : activeMode === "add-child" ? "Add child" : "Add relation"}
          </SheetTitle>
          <div className="text-sm text-muted-foreground">
            {getGovernanceLabel(sourceEntity)}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mx-auto w-full max-w-2xl space-y-5">
            {isEdit ? (
              <>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <div className="font-medium">{getGovernanceLabel(sourceEntity)}</div>
                  <div className="mt-1 text-muted-foreground">
                    Manage existing reporting relationships.
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Parent</div>
                  {step === "edit-parent" ? (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Changing parent for{" "}
                        <span className="font-medium text-foreground">
                          {getGovernanceLabel(sourceEntity)}
                        </span>
                        {currentParent && (
                          <>
                            {" · Current parent: "}
                            <span className="font-medium text-foreground">
                              {getGovernanceLabel(currentParent)}
                            </span>
                          </>
                        )}
                      </div>
                      <OrganizationDirectory
                        selectionMode="radio"
                        selectedId={existingId || null}
                        onSelect={(item) => {
                          setExistingId(item.id);
                          setSelectedParent(item);
                        }}
                        excludeIds={[sourceEntity?.id, currentParent?.id].filter(Boolean)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {currentParent ? getGovernanceLabel(currentParent) : "No parent assigned"}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setExistingId("");
                            setSelectedParent(null);
                            setStep("edit-parent");
                          }}
                        >
                          {currentParent ? "Change" : "Add parent"}
                        </Button>
                        {currentParent && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={removeParent}
                            disabled={saving}
                          >
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Children</div>
                  {childEntities.length ? (
                    childEntities.map((child) => (
                      <div key={child.id} className="flex items-center gap-2 rounded-lg border p-3">
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {getGovernanceLabel(child)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeChild(child.id)}
                          disabled={saving}
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No child relations.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {activeMode === "add-parent"
                    ? "Select one organization to become this organization's parent."
                    : "Select one or more organizations that currently have no parent."}
                </p>
                <OrganizationDirectory
                  selectionMode={selectionMode}
                  selectedIds={
                    selectionMode === "checkbox"
                      ? existingIds
                      : existingId
                        ? [existingId]
                        : []
                  }
                  selectedId={selectionMode === "radio" ? existingId || null : null}
                  onSelect={(item) => {
                    if (selectionMode === "checkbox") {
                      setExistingIds((current) =>
                        current.includes(item.id)
                          ? current.filter((id) => id !== item.id)
                          : [...current, item.id],
                      );
                    } else {
                      setExistingId(item.id);
                    }
                  }}
                  excludeIds={[sourceEntity?.id].filter(Boolean)}
                  onlyWithoutParent={activeMode === "add-child"}
                />
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="border-t bg-background px-5 py-4 sm:px-6">
          {((!isEdit && step !== "relation") ||
            (isEdit && step !== "edit")) && (
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              disabled={saving}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {isEdit && step === "edit-parent" && (
            <Button
              type="button"
              onClick={save}
              disabled={saving || !existingId}
            >
              {saving
                ? "Saving..."
                : currentParent
                  ? `Change parent: ${getGovernanceLabel(selectedParent)}`
                  : selectedParent
                    ? `Add parent: ${getGovernanceLabel(selectedParent)}`
                    : "Add parent"}
            </Button>
          )}
          {!isEdit && (step === "existing" || step === "create") && (
            <Button
              type="button"
              onClick={save}
              disabled={
                saving ||
                (step === "existing" &&
                  (selectionMode === "checkbox"
                    ? !existingIds.length
                    : !existingId))
              }
            >
              {saving
                ? "Saving..."
                : step === "create"
                  ? "Create relation"
                  : activeMode === "add-parent"
                    ? "Save parent"
                    : activeMode === "add-child"
                      ? "Save children"
                      : "Save relation"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
