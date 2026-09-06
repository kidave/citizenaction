"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthorityCard from "./AuthorityCard";
import EntityTypeSelector from "./EntityTypeSelector";
import { useAuthorityExplorer } from "@/hooks/governance/useAuthorityExplorer";
import { useGovernance } from "@/hooks/governance/useGovernance";

export default function AuthorityExplorer({
  selected = [],
  onChange = () => {},
  context,
}) {
  const {
    search,
    setSearch,
    scope,
    setScope,
    entityType,
    setEntityType,
    stack,
    setStack,
    reset,
  } = useAuthorityExplorer();

  const currentParent = stack[stack.length - 1] || null;

  const effectiveScope = useMemo(
    () => ({
      type: scope?.scope_type || null,
      code: scope?.scope_code || null,
    }),
    [scope?.scope_type, scope?.scope_code],
  );

  const { data = [], isLoading, error } = useGovernance({
    search,
    entityType,
    parentId: currentParent?.id || null,
    scopeType: effectiveScope.type,
    scopeCode: effectiveScope.code,
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

  const open = (entity) => {
    setStack((prev) => [...prev, entity]);
  };

  const navigateBack = () => {
    setStack((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    reset();
    if (context?.scope_type || context?.scope_code) {
      setScope({
        scope_type: context.scope_type || null,
        scope_code: context.scope_code || null,
      });
    }
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

      {stack.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
          <div className="min-w-0 truncate text-sm">
            <span className="text-muted-foreground">Inside </span>
            <span className="font-medium">{currentParent?.label || currentParent?.name}</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={navigateBack}>
            Back
          </Button>
        </div>
      )}

      {selected.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {selected.map((entity) => (
            <AuthorityCard
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
          <AuthorityCard
            key={entity.id}
            entity={entity}
            isSelected={false}
            onToggle={toggle}
            onOpen={open}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={handleReset} className="text-xs text-primary">
          Reset filters
        </Button>
      </div>
    </div>
  );
}
