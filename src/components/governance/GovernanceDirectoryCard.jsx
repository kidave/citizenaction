"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GovernanceCardActions from "@/components/governance/GovernanceCardActions";
import { getGovernanceHref, getGovernanceInitials, getGovernanceName } from "@/utils/governance";

export default function GovernanceDirectoryCard({
  entity, tab = "organizations", selectionMode = null, selected = false, onSelect,
  onOpen, onView, onViewTree, onEdit, onManageRelations, onAddParent, onAddChild, hasParent = false, onAddAddress, onRemoveAddress, onAddGeography,
  onRemoveGeography, onManageLinks, hasAddress = false, hasGeography = false,
  hasLinks = false, onDelete,
}) {
  const name = getGovernanceName(entity);
  const editLabel = tab === "people" ? "Edit Person" : tab === "positions" ? "Edit Position" : "Edit Organization";
  const deleteTitle = tab === "people" ? "Delete this person?" : tab === "positions" ? "Delete this position?" : "Delete this organization?";
  const href = getGovernanceHref({ ...entity, tab });
  const avatarUrl = entity.image_url || (tab === "organizations" ? entity.current_holder_image_url : null);
  const isSelectable = selectionMode === "radio" || selectionMode === "checkbox";
  const canManage = !isSelectable && (
    onOpen || onView || onViewTree || onEdit || onManageRelations || onAddParent || onAddChild || onAddAddress || onRemoveAddress ||
    onAddGeography || onRemoveGeography || onManageLinks || onDelete
  );

  const content = (
    <div className={"relative flex min-h-[76px] h-full items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-accent/50 " + (selected ? "bg-primary/5" : "")}>
      {isSelectable && (
        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center text-muted-foreground" aria-hidden="true">
          {selectionMode === "radio" ? (
            <Circle className={"h-4 w-4 " + (selected ? "fill-primary stroke-primary" : "")} />
          ) : (
            <span className={"grid h-4 w-4 place-items-center rounded-sm border " + (selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50")}>
              {selected && <Check className="h-3 w-3" />}
            </span>
          )}
        </span>
      )}
      <Avatar className="h-9 w-9 shrink-0 rounded-md">
        <AvatarImage src={avatarUrl || undefined} alt={name} />
        <AvatarFallback className="rounded-md text-[11px]">{getGovernanceInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 pr-5 text-center">
        <div className="line-clamp-2 text-sm font-medium leading-snug">{name}</div>
      </div>
    </div>
  );

  if (isSelectable) {
    return (
      <button type="button" onClick={() => onSelect?.(entity)} className="block h-full w-full text-left" aria-label={name} aria-pressed={selected}>
        {content}
      </button>
    );
  }

  const linked = tab === "organizations" && onOpen ? (
    <button type="button" onClick={(event) => { event.stopPropagation(); onOpen?.(entity); }} className="block h-full w-full text-left" aria-label={"View " + name}>
      {content}
    </button>
  ) : href ? (
    <Link href={href} className="block h-full" aria-label={name}>{content}</Link>
  ) : content;

  return canManage ? (
    <GovernanceCardActions
      onView={tab === "organizations" ? () => onView?.(entity) : undefined}
      onViewTree={tab === "organizations" ? () => onViewTree?.(entity) : undefined}
      onEdit={onEdit}
      editLabel={editLabel}
      onManageRelations={onManageRelations}
      onAddParent={onAddParent}
      onAddChild={onAddChild}
      hasParent={hasParent}
      onAddAddress={onAddAddress}
      onRemoveAddress={onRemoveAddress}
      onAddGeography={onAddGeography}
      onRemoveGeography={onRemoveGeography}
      onManageLinks={onManageLinks}
      hasAddress={hasAddress}
      hasGeography={hasGeography}
      hasLinks={hasLinks}
      deleteTitle={deleteTitle}
      onDelete={onDelete}
    >
      {linked}
    </GovernanceCardActions>
  ) : linked;
}
