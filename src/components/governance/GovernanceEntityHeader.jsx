"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MenuButton from "@/components/ui/MenuButton";

import { getGovernanceInitials } from "@/utils/governance";

export default function GovernanceEntityHeader({
  entity,
  draft,
  editing,
  canEdit = false,
  childEntities = [],
  onEdit,
  onChange,
  onAddParent,
  onAddChild,
  onAddGeography,
  onChangeParent,
  onDelete,
}) {
  if (!entity) return null;

  const name = editing ? draft?.name || "" : entity.name || "";
  const imageUrl = editing ? draft?.image_url : entity.image_url;

  return (
    <div className="flex items-start gap-3 pr-8">
      <Avatar className="h-12 w-12 shrink-0 rounded-xl">
        <AvatarImage src={imageUrl || undefined} alt="" />
        <AvatarFallback className="rounded-xl">
          {getGovernanceInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            autoFocus
            value={draft?.name || ""}
            onChange={(event) => onChange?.("name", event.target.value)}
            className="text-lg font-semibold"
          />
        ) : (
          <>
            <h2 className="truncate text-xl font-semibold" title={name}>
              {name}
            </h2>

            {entity.short_name && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {entity.short_name}
              </p>
            )}
          </>
        )}
      </div>

      {canEdit && !editing && (
        <MenuButton
          onEdit={onEdit}
          onAddParent={onAddParent}
          onAddChild={onAddChild}
          onAddGeography={onAddGeography}
          onChangeParent={onChangeParent}
          onDelete={onDelete}
          deleteTitle={`Delete ${name}?`}
          deleteDescription={
            childEntities.length
              ? "Move the child entities before deleting this entity."
              : "This permanently removes this governance entity."
          }
        />
      )}
    </div>
  );
}
