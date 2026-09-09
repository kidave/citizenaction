"use client";

import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function MenuButton({
  onEdit,
  onAddParent,
  onAddChild,
  onChangeParent,
  onDelete,
  editLabel = "Edit",
  deleteTitle = "Delete this post?",
  deleteDescription = "This action cannot be undone. The post and related data will be permanently removed.",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const governanceActions = Boolean(onAddParent || onAddChild || onChangeParent);

  const closeAndRun = (callback) => (event) => {
    event.stopPropagation();
    setMenuOpen(false);
    callback?.();
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={closeAndRun(onEdit)}>
            {editLabel}
          </DropdownMenuItem>

          {governanceActions && (
            <>
              <DropdownMenuItem onClick={closeAndRun(onAddParent)}>
                Add parent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={closeAndRun(onAddChild)}>
                Add child
              </DropdownMenuItem>
              <DropdownMenuItem onClick={closeAndRun(onChangeParent)}>
                Change parent
              </DropdownMenuItem>
            </>
          )}

          {onDelete && (
            <DropdownMenuItem
              className="text-red-500"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={deleteTitle}
          description={deleteDescription}
          confirmText="Delete"
          onConfirm={(event) => {
            event?.stopPropagation();
            onDelete?.();
            setConfirmOpen(false);
          }}
        />
      )}
    </>
  );
}
