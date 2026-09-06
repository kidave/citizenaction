"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GovernanceCard from "./GovernanceCard";
import EntityTypeSelector from "./EntityTypeSelector";
import { useGovernance } from "@/hooks/governance/useGovernance";

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

  const toggle = (entity) => {
    const exists = selected.some((item) => item.id === entity.id);
    onChange(
      exists
        ? selected.filter((item) => item.id !== entity.id)
        : [...selected, entity],
    );
  };

  const open = (entity) => setStack((prev) => [...prev, entity]);
  const navigateBack = () => setStack((prev) => prev.slice(0, -1));

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

      {stack.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
          <div className="min-w-0 truncate text-sm">
            <span className="text-muted-foreground">Inside </span>
            <span className="font-medium">{currentParent?.name}</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={navigateBack}>
            Back
          </Button>
        </div>
      )}

      {selected.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {selected.map((entity) => (
            <GovernanceCard
              key={entity.id}
              entity={entity}
              isSelected
              onToggle={toggle}
              onOpen={open}
            />
          ))}
        </div>
      )}

      <div className="grid max-h-[400px] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && (
          <p className="col-span-full text-sm text-muted-foreground">Loading...</p>
        )}
        {error && (
          <p className="col-span-full text-sm text-destructive">
            Failed to load governance data.
          </p>
        )}
        {!isLoading && !error && visibleItems.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            No governance entities found
          </p>
        )}
        {visibleItems.map((entity) => (
          <GovernanceCard
            key={entity.id}
            entity={entity}
            isSelected={false}
            onToggle={toggle}
            onOpen={open}
          />
        ))}
      </div>

      {stack.length > 0 && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={() => setStack([])} className="text-xs text-primary">
            Reset hierarchy
          </Button>
        </div>
      )}
    </div>
  );
}
