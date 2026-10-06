"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export default function GovernanceCardActions({
  children,
  onEdit,
  onDelete,
  onAddAddress,
  onAddGeography,
  onManageLinks,
  hasAddress = false,
  hasGeography = false,
  hasLinks = false,
  deleteTitle = "Delete this item?",
  deleteDescription = "This action cannot be undone.",
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!onEdit && !onDelete && !onAddAddress && !onAddGeography && !onManageLinks) return children;

  const edit = (event) => {
    event?.stopPropagation();
    onEdit?.();
  };
  const requestDelete = (event) => {
    event?.stopPropagation();
    setConfirmOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="group relative h-full">
            {children}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 z-10 h-8 w-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" aria-label="More actions" onClick={(event) => event.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && <DropdownMenuItem onSelect={edit}><Pencil className="mr-2 h-4 w-4" />Edit organization</DropdownMenuItem>}
                {(onAddAddress || onAddGeography || onManageLinks) && <DropdownMenuSeparator />}
                {onAddAddress && <DropdownMenuItem onSelect={(event) => { event.stopPropagation(); onAddAddress?.(); }}>{hasAddress ? "Edit address" : "Add address"}</DropdownMenuItem>}
                {onAddGeography && <DropdownMenuItem onSelect={(event) => { event.stopPropagation(); onAddGeography?.(); }}>{hasGeography ? "Change geography" : "Add geography"}</DropdownMenuItem>}
                {onManageLinks && <DropdownMenuItem onSelect={(event) => { event.stopPropagation(); onManageLinks?.(); }}>{hasLinks ? "Manage links" : "Add links"}</DropdownMenuItem>}
                {(onDelete && (onEdit || onAddAddress || onAddGeography || onManageLinks)) && <DropdownMenuSeparator />}
                {onDelete && <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={requestDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onEdit && <ContextMenuItem onSelect={edit}><Pencil className="mr-2 h-4 w-4" />Edit organization</ContextMenuItem>}
          {(onAddAddress || onAddGeography || onManageLinks) && <ContextMenuSeparator />}
          {onAddAddress && <ContextMenuItem onSelect={(event) => { event.stopPropagation(); onAddAddress?.(); }}>{hasAddress ? "Edit address" : "Add address"}</ContextMenuItem>}
          {onAddGeography && <ContextMenuItem onSelect={(event) => { event.stopPropagation(); onAddGeography?.(); }}>{hasGeography ? "Change geography" : "Add geography"}</ContextMenuItem>}
          {onManageLinks && <ContextMenuItem onSelect={(event) => { event.stopPropagation(); onManageLinks?.(); }}>{hasLinks ? "Manage links" : "Add links"}</ContextMenuItem>}
          {onDelete && <ContextMenuSeparator />}
          {onDelete && <ContextMenuItem className="text-destructive focus:text-destructive" onSelect={requestDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</ContextMenuItem>}
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title={deleteTitle} description={deleteDescription} confirmText="Delete" onConfirm={async () => { await onDelete?.(); setConfirmOpen(false); }} />
    </>
  );
}
