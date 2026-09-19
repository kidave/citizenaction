"use client";

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
  deleteTitle = "Delete this item?",
  deleteDescription = "This action cannot be undone.",
}) {
  const hasActions = onEdit || onDelete;
  if (!hasActions) return children;

  const runEdit = (event) => {
    event?.stopPropagation();
    onEdit?.();
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          {onEdit && (
            <ContextMenuItem onSelect={runEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
          )}
          {onEdit && onDelete && <ContextMenuSeparator />}
          {onDelete && (
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(event) => {
                event.stopPropagation();
                document.dispatchEvent(
                  new CustomEvent("citizen-action-governance-delete", {
                    detail: { deleteTitle, deleteDescription, onDelete },
                  }),
                );
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label="More actions"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onSelect={runEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {onEdit && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(event) => {
                event.stopPropagation();
                document.dispatchEvent(
                  new CustomEvent("citizen-action-governance-delete", {
                    detail: { deleteTitle, deleteDescription, onDelete },
                  }),
                );
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <GovernanceDeleteConfirmListener />
    </>
  );
}

function GovernanceDeleteConfirmListener() {
  const React = require("react");
  const { useEffect, useState } = React;
  const [state, setState] = useState(null);

  useEffect(() => {
    const handler = (event) => setState(event.detail);
    document.addEventListener("citizen-action-governance-delete", handler);
    return () => document.removeEventListener("citizen-action-governance-delete", handler);
  }, []);

  if (!state) return null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) setState(null);
      }}
      title={state.deleteTitle}
      description={state.deleteDescription}
      confirmText="Delete"
      onConfirm={async () => {
        await state.onDelete?.();
        setState(null);
      }}
    />
  );
}
