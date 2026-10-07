"use client";

import { GovernanceActionContextMenu, GovernanceActionDropdown } from "@/components/governance/GovernanceActionMenu";

export default function GovernanceCardActions({
  children,
  onView,
  onEdit,
  onManageRelations,
  onAddAddress,
  onRemoveAddress,
  onAddGeography,
  onRemoveGeography,
  onManageLinks,
  hasAddress = false,
  hasGeography = false,
  hasLinks = false,
  onDelete,
}) {
  const hasActions = onView || onEdit || onManageRelations || onAddAddress || onRemoveAddress ||
    onAddGeography || onRemoveGeography || onManageLinks || onDelete;

  if (!hasActions) return children;

  return (
    <GovernanceActionContextMenu
      onView={onView}
      onEdit={onEdit}
      onManageRelations={onManageRelations}
      onAddAddress={onAddAddress}
      onRemoveAddress={onRemoveAddress}
      onAddGeography={onAddGeography}
      onRemoveGeography={onRemoveGeography}
      onManageLinks={onManageLinks}
      onDelete={onDelete}
      hasAddress={hasAddress}
      hasGeography={hasGeography}
      hasLinks={hasLinks}
    >
      <div className="group relative h-full">
        {children}
        <GovernanceActionDropdown
          onView={onView}
          onEdit={onEdit}
          onManageRelations={onManageRelations}
          onAddAddress={onAddAddress}
          onRemoveAddress={onRemoveAddress}
          onAddGeography={onAddGeography}
          onRemoveGeography={onRemoveGeography}
          onManageLinks={onManageLinks}
          onDelete={onDelete}
          hasAddress={hasAddress}
          hasGeography={hasGeography}
          hasLinks={hasLinks}
          className="absolute right-1 top-1 z-10 h-8 w-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        />
      </div>
    </GovernanceActionContextMenu>
  );
}
