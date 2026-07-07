"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import ClassificationSearch from "./ClassificationSearch";

export default function StandardsToolbar({
  search,
  setSearch,
  canEdit,
  onCreate,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <ClassificationSearch value={search} onChange={setSearch} />
      </div>

      {canEdit && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Code
        </Button>
      )}
    </div>
  );
}
