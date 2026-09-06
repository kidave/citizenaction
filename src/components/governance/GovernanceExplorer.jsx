"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GovernanceCard from "./GovernanceCard";
import EntityTypeSelector from "./EntityTypeSelector";
import { useGovernance } from "@/hooks/governance/useGovernance";
import { getGovernanceLabel } from "@/utils/governance";

export default function GovernanceExplorer({
  selected = [],
  onChange = () => {},
}) {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [stack, setStack] = useState([]);
  const currentParent = stack[stack.length - 1] || null;

  const { data = [], isLoading, error } = useGovernance({
    search,
    entityType,
    parentId: currentParent?.id || null,
    enabled: true,
  });

  const open = (entity) => setStack((prev) => [...prev, entity]);
  const navigateBack = () => setStack((prev) => prev.slice(0, -1));

  const toggle = (entity) => {
    const exists = selected.some((item) => item.id === entity.id);
    onChange(
      exists
        ? selected.filter((item) => item.id !== entity.id)
        : [...selected, entity],
    );
  };

  const selectedIds = new Set(selected.map((item) => item.id));
  const visibleItems = data.filter((item) => !selectedIds.has(item.id));

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Input
          placeholder="Search governance..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <EntityTypeSelector value={entityType} onChange={setEntityType} />
      </div>

      {currentParent && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={navigateBack}
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 truncate text-sm">
            <span className="text-muted-foreground">Inside </span>
            <span className="font-medium">{getGovernanceLabel(currentParent)}</span>
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Selected</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {selected.map((entity) => (
              <div key={entity.id} className="cursor-pointer" onClick={() => toggle(entity)}>
                <GovernanceCard entity={entity} />
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">Failed to load governance data.</p>}

      {!isLoading && !error && visibleItems.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No governance entities found.
        </p>
      )}

      <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
        {visibleItems.map((entity) => (
          <GovernanceCard key={entity.id} entity={entity} onOpen={open} />
        ))}
      </div>
    </div>
  );
}
