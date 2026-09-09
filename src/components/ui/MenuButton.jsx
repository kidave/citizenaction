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
  deleteTitle = "Delete this post?",
  deleteDescription = "This action cannot be undone. The post and related data will be permanently removed.",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onEdit?.();
            }}
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={deleteTitle}
        description={deleteDescription}
        confirmText="Delete"
        onConfirm={(e) => {
          e?.stopPropagation();
          onDelete?.();
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
