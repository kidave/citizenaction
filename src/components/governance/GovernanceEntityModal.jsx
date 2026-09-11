"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import GovernanceEntityHeader from "./GovernanceEntityHeader";
import GovernanceEntityDetails from "./GovernanceEntityDetails";
import GovernanceEntityForm from "./GovernanceEntityForm";

import AddGeographyDialog from "@/components/geography/AddGeographyDialog";

import {
  getGovernanceLabel,
  governanceRequiresValidTo,
} from "@/utils/governance";

import { useGovernanceEntityForm } from "@/hooks/governance/useGovernanceEntityForm";
import { useGovernanceEntityDetails } from "@/hooks/governance/useGovernanceEntityDetails";
import { useGovernanceEntityMutation } from "@/hooks/governance/useGovernanceEntityMutation";

export default function GovernanceEntityModal({
  open,
  onOpenChange,
  entity,
  parent,
  childEntities = [],
  canEdit = false,
  onSelect,
  onSaved,
  onDeleted,
  onAddRelation,
  categories = [],
}) {
  const [geographyOpen, setGeographyOpen] = useState(false);

  const { data: details, isLoading } = useGovernanceEntityDetails(
    entity?.id,
    open,
  );

  const {
    updateEntity,
    deleteEntity,
    isUpdating,
    isDeleting,
  } = useGovernanceEntityMutation();

  const {
    editing,
    draft,
    updateDraft,
    closeEditing,
    startEditing,
    validate,
  } = useGovernanceEntityForm(entity);

  if (!entity) return null;

  const label = getGovernanceLabel(entity);
  const status = draft?.status || entity.status || "active";
  const requiresValidTo = governanceRequiresValidTo(status);
  const saving = isUpdating || isDeleting;
  const hasGeography = Boolean(details?.geographyId || entity.geography_id);

  async function handleSave() {
    const validationError = validate(requiresValidTo);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const saved = await updateEntity({
        entity,
        draft,
      });

      closeEditing();
      onSaved?.(saved);
      toast.success("Governance entity updated");
    } catch (error) {
      toast.error(
        error?.message || "Unable to save governance entity",
      );
    }
  }

  async function handleDelete() {
    if (childEntities.length) {
      toast.error(
        "Move the child entities before deleting this entity.",
      );
      return;
    }

    try {
      await deleteEntity(entity.id);

      toast.success("Governance entity deleted");
      onDeleted?.(entity);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(
        error?.message || "Unable to delete governance entity",
      );
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value && !saving) closeEditing();
          if (!saving) onOpenChange?.(value);
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <GovernanceEntityHeader
              entity={entity}
              draft={draft}
              editing={editing}
              canEdit={canEdit}
              childEntities={childEntities}
              onEdit={startEditing}
              onChange={updateDraft}
              onAddRelation={() => onAddRelation?.(entity)}
              onAddGeography={!hasGeography ? () => setGeographyOpen(true) : undefined}
              onChangeGeography={hasGeography ? () => setGeographyOpen(true) : undefined}
              onDelete={handleDelete}
            />

            {editing ? (
              <GovernanceEntityForm
                entity={entity}
                draft={draft}
                categories={categories}
                saving={saving}
                requiresValidTo={requiresValidTo}
                onChange={updateDraft}
                onCancel={closeEditing}
                onSave={handleSave}
              />
            ) : (
              <GovernanceEntityDetails
                entity={entity}
                parent={parent}
                leader={details?.leader}
                geography={details?.geography}
                attachments={details?.attachments || []}
                links={details?.links || []}
                isLoading={isLoading}
                canEdit={canEdit}
                onSelect={onSelect}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddGeographyDialog
        open={geographyOpen}
        onOpenChange={setGeographyOpen}
        governanceId={entity.id}
        entityName={label}
        onSaved={() => onSaved?.(entity)}
      />
    </>
  );
}
