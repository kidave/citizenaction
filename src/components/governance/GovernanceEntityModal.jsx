"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import GovernanceEntityHeader from "./GovernanceEntityHeader";
import GovernanceEntityDetails from "./GovernanceEntityDetails";
import GovernanceEntityForm from "./GovernanceEntityForm";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";
import { getGovernanceLabel, governanceRequiresValidTo } from "@/utils/governance";
import { useGovernanceEntityForm } from "@/hooks/governance/useGovernanceEntityForm";
import { useGovernanceEntityDetails } from "@/hooks/governance/useGovernanceEntityDetails";
import { useGovernanceEntityMutation } from "@/hooks/governance/useGovernanceEntityMutation";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";

export default function GovernanceEntityModal({ open, onOpenChange, entity, parent, childEntities = [], canEdit = false, initialEditing = false, onSelect, onSaved, onDeleted, onAddRelation, onEditRelations, onAddGeography: externalAddGeography, onChangeGeography: externalChangeGeography, onRemoveGeography: externalRemoveGeography, categories = [] }) {
  const [geographyOpen, setGeographyOpen] = useState(false);
  const { data: details, isLoading } = useGovernanceEntityDetails(entity?.id, open);
  const { updateEntity, deleteEntity, isUpdating, isDeleting } = useGovernanceEntityMutation();
  const { removeGeography } = useGovernanceGeographyMutation();
  const { editing, draft, updateDraft, closeEditing, startEditing, setEditing, validate } = useGovernanceEntityForm(entity);

  useEffect(() => {
    if (open && initialEditing && entity) setEditing(true);
  }, [open, initialEditing, entity, setEditing]);

  if (!entity) return null;

  const label = getGovernanceLabel(entity);
  const status = draft?.status || entity.status || "active";
  const requiresValidTo = governanceRequiresValidTo(status);
  const saving = isUpdating || isDeleting;
  const hasGeography = Boolean(details?.geographyId || entity.geography_id);

  async function handleSave() {
    const validationError = validate(requiresValidTo);
    if (validationError) return toast.error(validationError);
    try {
      const saved = await updateEntity({ entity, draft });
      closeEditing();
      onSaved?.(saved);
      toast.success("Governance entity updated");
    } catch (error) { toast.error(error?.message || "Unable to save governance entity"); }
  }

  async function handleDelete() {
    if (childEntities.length) return toast.error("Move the child entities before deleting this entity.");
    try {
      await deleteEntity(entity.id);
      toast.success("Governance entity deleted");
      onDeleted?.(entity);
      onOpenChange?.(false);
    } catch (error) { toast.error(error?.message || "Unable to delete governance entity"); }
  }

  const addGeography = externalAddGeography || (() => setGeographyOpen(true));
  const changeGeography = externalChangeGeography || (() => setGeographyOpen(true));
  const removeGeographyLink = externalRemoveGeography || (async () => {
    try {
      await removeGeography({ governanceId: entity.id });
      await onSaved?.(entity);
      toast.success("Geography removed");
    } catch (error) { toast.error(error?.message || "Unable to remove geography"); }
  });

  return (
    <>
      <Sheet open={open} onOpenChange={(value) => { if (!value && !saving) closeEditing(); if (!saving) onOpenChange?.(value); }}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl">
          <SheetHeader className="sr-only"><SheetTitle>{label}</SheetTitle></SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <GovernanceEntityHeader entity={entity} draft={draft} editing={editing} canEdit={canEdit} childEntities={childEntities} onEdit={startEditing} onChange={updateDraft} onAddRelation={() => onAddRelation?.(entity)} onEditRelations={() => onEditRelations?.(entity)} onAddGeography={!hasGeography ? addGeography : undefined} onChangeGeography={hasGeography ? changeGeography : undefined} onRemoveGeography={hasGeography ? removeGeographyLink : undefined} onDelete={handleDelete} />
            <div className="mt-2">
              {editing ? <GovernanceEntityForm entity={entity} draft={draft} categories={categories} saving={saving} requiresValidTo={requiresValidTo} onChange={updateDraft} onCancel={closeEditing} onSave={handleSave} /> : <GovernanceEntityDetails entity={entity} parent={parent} leader={details?.leader} geography={details?.geography} attachments={details?.attachments || []} links={details?.links || []} isLoading={isLoading} canEdit={canEdit} onSelect={onSelect} />}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <AddGeographyDialog open={geographyOpen} onOpenChange={setGeographyOpen} governanceId={entity.id} entityName={label} onSaved={() => onSaved?.(entity)} />
    </>
  );
}
