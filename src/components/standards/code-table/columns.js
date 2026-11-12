"use client";

import { ArrowUpDown } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { DataTableRowActions } from "./row-actions";

export function getColumns({ canEdit, onEdit, onDelete }) {
  return [
    {
      id: "select",

      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),

      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },

    {
      accessorKey: "code",

      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },

    {
      accessorKey: "title",

      header: "Title",
    },

    {
      accessorKey: "level",

      header: "Level",
    },

    {
      accessorKey: "parent_code",

      header: "Parent",
    },

    {
      accessorKey: "child_count",

      header: "Children",
    },

    {
      accessorKey: "verified",

      header: "Verified",

      cell: ({ row }) =>
        row.original.verified ? (
          <Badge>Verified</Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        ),
    },

    {
      id: "actions",

      cell: ({ row }) =>
        canEdit ? (
          <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
        ) : null,
    },
  ];
}
