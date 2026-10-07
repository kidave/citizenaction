import { useState } from "react";
import {
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export function GovernanceActionMenuItems({
  MenuItem,
  onView,
  onEdit,
  onManageRelations,
  onAddAddress,
  onRemoveAddress,
  onManageLinks,
  onAddGeography,
  onRemoveGeography,
  onDelete,
  hasAddress = false,
  hasLinks = false,
  hasGeography = false,
  stopPropagation = true,
}) {
  const run = (callback, event) => {
    if (stopPropagation) event?.stopPropagation();
    callback?.();
  };

  return (
    <>
      {onView && (
        <MenuItem onSelect={(event) => run(onView, event)}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View Organization
        </MenuItem>
      )}
      {onEdit && (
        <MenuItem onSelect={(event) => run(onEdit, event)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Organization
        </MenuItem>
      )}
      {onManageRelations && (
        <>
          {(onView || onEdit) && <MenuSeparator />}
          <MenuItem onSelect={(event) => run(onManageRelations, event)}>
            <Plus className="mr-2 h-4 w-4" />
            Manage Relations
          </MenuItem>
        </>
      )}

      {(onManageLinks || onAddAddress || onRemoveAddress || onAddGeography || onRemoveGeography) && (
        <MenuSeparator />
      )}

      {onManageLinks && (
        <MenuItem onSelect={(event) => run(onManageLinks, event)}>
          <LinkIcon className="mr-2 h-4 w-4" />
          "Add/Edit Links"
        </MenuItem>
      )}

      {onAddAddress && (
        <MenuItem onSelect={(event) => run(onAddAddress, event)}>
          <MapPin className="mr-2 h-4 w-4" />
          "Add/Edit Address"
        </MenuItem>
      )}

      {onRemoveAddress && hasAddress && (
        <MenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(event) => run(onRemoveAddress, event)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Address
        </MenuItem>
      )}

      {onAddGeography && (
        <MenuItem onSelect={(event) => run(onAddGeography, event)}>
          <MapPin className="mr-2 h-4 w-4" />
          "Add/Edit Geography"
        </MenuItem>
      )}

      {onRemoveGeography && hasGeography && (
        <MenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(event) => run(onRemoveGeography, event)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Geography
        </MenuItem>
      )}

      {onDelete && (
        <>
          <MenuSeparator />
          <MenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(event) => run(onDelete, event)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </MenuItem>
        </>
      )}
    </>
  );
}

export function GovernanceActionDropdown({
  onView,
  onEdit,
  onManageRelations,
  onAddAddress,
  onRemoveAddress,
  onManageLinks,
  onAddGeography,
  onRemoveGeography,
  onDelete,
  hasAddress = false,
  hasLinks = false,
  hasGeography = false,
  className = "",
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestDelete = () => {
    if (onDelete) setConfirmOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={className}
            aria-label="More actions"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="text-lg leading-none">⋯</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <GovernanceActionMenuItems
            MenuItem={DropdownMenuItem}
            MenuSeparator={DropdownMenuSeparator}
            onView={onView}
            onEdit={onEdit}
            onManageRelations={onManageRelations}
            onAddAddress={onAddAddress}
            onRemoveAddress={onRemoveAddress}
            onManageLinks={onManageLinks}
            onAddGeography={onAddGeography}
            onRemoveGeography={onRemoveGeography}
            hasAddress={hasAddress}
            hasLinks={hasLinks}
            hasGeography={hasGeography}
            onDelete={onDelete ? requestDelete : undefined}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this organization?"
          description="This action cannot be undone. Related governance history may need to be removed first."
          confirmText="Delete"
          onConfirm={async () => {
            await onDelete?.();
            setConfirmOpen(false);
          }}
        />
      )}
    </>
  );
}

export function GovernanceActionContextMenu({
  children,
  onView,
  onEdit,
  onManageRelations,
  onAddAddress,
  onRemoveAddress,
  onManageLinks,
  onAddGeography,
  onRemoveGeography,
  onDelete,
  hasAddress = false,
  hasLinks = false,
  hasGeography = false,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent onCloseAutoFocus={(event) => event.preventDefault()}>
          <GovernanceActionMenuItems
            MenuItem={ContextMenuItem}
            MenuSeparator={ContextMenuSeparator}
            onView={onView}
            onEdit={onEdit}
            onManageRelations={onManageRelations}
            onAddAddress={onAddAddress}
            onRemoveAddress={onRemoveAddress}
            onManageLinks={onManageLinks}
            onAddGeography={onAddGeography}
            onRemoveGeography={onRemoveGeography}
            hasAddress={hasAddress}
            hasLinks={hasLinks}
            hasGeography={hasGeography}
            onDelete={
              onDelete
                ? () => setConfirmOpen(true)
                : undefined
            }
          />
        </ContextMenuContent>
      </ContextMenu>

      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this organization?"
          description="This action cannot be undone. Related governance history may need to be removed first."
          confirmText="Delete"
          onConfirm={async () => {
            await onDelete?.();
            setConfirmOpen(false);
          }}
        />
      )}
    </>
  );
}
