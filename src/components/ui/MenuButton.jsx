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
  onDelete,
  onAddRelation,
  onAddGeography,
  onChangeGeography,
  editRelations,
  editGeography,
  editLabel = "Edit",
  deleteLabel = "Delete",
  deleteTitle = "Delete this item?",
  deleteDescription = "This action cannot be undone.",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const run = (callback) => {
    setMenuOpen(false);
    callback?.();
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); run(onEdit); }}>
              {editLabel}
            </DropdownMenuItem>
          )}
          {onAddRelation && (
            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); run(onAddRelation); }}>
              Add relation
            </DropdownMenuItem>
          )}
          {editRelations && (
            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); run(editRelations); }}>
              Edit relations
            </DropdownMenuItem>
          )}
          {onAddGeography && (
            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); run(onAddGeography); }}>
              Add geography
            </DropdownMenuItem>
          )}
          {onChangeGeography && (
            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); run(onChangeGeography); }}>
              Change geography
            </DropdownMenuItem>
          )}
          {editGeography && (
            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); run(editGeography); }}>
              Edit geography
            </DropdownMenuItem>
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
              {deleteLabel}
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
