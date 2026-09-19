"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import GovernanceEntityHeader from "./GovernanceEntityHeader";
import GovernanceEntityDetails from "./GovernanceEntityDetails";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";
import { getGovernanceLabel } from "@/utils/governance";
import { useGovernanceEntityDetails } from "@/hooks/governance/useGovernanceEntityDetails";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";

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
  onEdit,
  onAddRelation,
  onEditRelations,
  onAddGeography: externalAddGeography,
  onChangeGeography: externalChangeGeography,
  onRemoveGeography: externalRemoveGeography,
}) {
  const [geographyOpen, setGeographyOpen] = useState(false);
  const { data: details, isLoading } = useGovernanceEntityDetails(entity?.id, open);
  const { removeGeography } = useGovernanceGeographyMutation();
  const { deleteOrganization, isPending } = useGovernanceCrud();

  if (!entity) return null;

  const label = getGovernanceLabel(entity);
  async function handleDelete() {
    if (childEntities.length) return toast.error("Move the child entities before deleting this organization.");
    try {
      await deleteOrganization(entity.id);
      toast.success("Organization deleted");
      onDeleted?.(entity);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to delete organization");
    }
  }
  const hasGeography = Boolean(details?.geographyId || entity.geography_id);
  const addGeography = externalAddGeography || (() => setGeographyOpen(true));
  const changeGeography = externalChangeGeography || (() => setGeographyOpen(true));
  const removeGeographyLink = externalRemoveGeography || (async () => {
    try {
      await removeGeography({ governanceId: entity.id });
      await onSaved?.(entity);
      toast.success("Geography removed");
    } catch (error) {
      toast.error(error?.message || "Unable to remove geography");
    }
  });

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl">
          <SheetHeader className="sr-only"><SheetTitle>{label}</SheetTitle></SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <GovernanceEntityHeader
              entity={entity}
              canEdit={canEdit}
              childEntities={childEntities}
              onEdit={onEdit}
              onAddRelation={() => onAddRelation?.(entity)}
              onEditRelations={() => onEditRelations?.(entity)}
              onAddGeography={!hasGeography ? addGeography : undefined}
              onChangeGeography={hasGeography ? changeGeography : undefined}
              onRemoveGeography={hasGeography ? removeGeographyLink : undefined}
              onDelete={isPending ? undefined : handleDelete}
            />
            <div className="mt-2">
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
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
