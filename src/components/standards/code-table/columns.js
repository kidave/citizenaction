"use client";

import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const createColumns = ({ canEdit = false, onEdit, onDelete }) => [
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
    cell: ({ row }) => row.original.parent_code ?? "-",
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
    accessorKey: "is_leaf",
    header: "Leaf",
    cell: ({ row }) =>
      row.original.is_leaf ? (
        <Badge variant="outline">Leaf</Badge>
      ) : (
        <Badge variant="secondary">Parent</Badge>
      ),
  },

  {
    id: "actions",

    cell: ({ row }) => {
      if (!canEdit) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
