"use client";

import { Input } from "@/components/ui/input";
import AuthorityCard from "./AuthorityCard";

import ScopeSelector from "@/components/shared/ScopeSelector";
import EntityTypeSelector from "@/components/governance/EntityTypeSelector";

import { useAuthorityExplorer } from "@/hooks/governance/useAuthorityExplorer";
import { useGovernanceTree } from "@/hooks/governance/useGovernanceTree";
import { getEntityHierarchy } from "@/utils/governance/getEntityHierarchy";

export default function AuthorityExplorer({
  selected = [],
  onChange,
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

  /* -------------------------
     DERIVE SCOPE
  ------------------------- */
  const { data = [], isLoading } = useGovernanceTree({
    parentId: search ? null : currentParent?.id,
    scopeType: scope.scope_type,
    scopeCode: scope.scope_code,
    search,
    entityType,
  });

  /* -------------------------
     TOGGLE (AUTO HIERARCHY)
  ------------------------- */
  function toggle(entity) {
    const exists = selected.find((e) => e.id === entity.id);

    if (exists) {
      onChange(selected.filter((e) => e.id !== entity.id));
      return;
    }

    const hierarchy = getEntityHierarchy(entity, data);

    const updated = [...selected];

    hierarchy.forEach((item) => {
      if (!updated.find((e) => e.id === item.id)) {
        updated.push(item);
      }
    });

    onChange(updated);
  }

  /* -------------------------
     NAVIGATION
  ------------------------- */
  function open(entity) {
    if (entity.entity_type !== "person") {
      setStack((prev) => [...prev, entity]);
    }
  }

  function goBack() {
    setStack((prev) => prev.slice(0, -1));
  }

  /* -------------------------
     SPLIT LIST
  ------------------------- */
  const selectedIds = new Set(selected.map((e) => e.id));

  const selectedItems = selected;

  const unselectedItems = data.filter(
    (e) => !selectedIds.has(e.id)
  );

  return (
    <div className="space-y-3">

      {/* TOP */}
      <div className="space-y-2">

        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search authority, dept, person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />

          <EntityTypeSelector
            value={entityType}
            onChange={setEntityType}
          />
        </div>

        <ScopeSelector
          value={scope}
          onChange={setScope}
          allowClear
        />

      </div>

      {/* SELECTED */}
      {selectedItems.length > 0 && (
        <div className="space-y-1">

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {selectedItems.map((entity) => (
              <AuthorityCard
                key={entity.id}
                entity={entity}
                isSelected={true}
                onToggle={toggle}
                onOpen={open}
              />
            ))}
          </div>

        </div>
      )}

      {/* LIST */}
      <div className="grid gap-2 overflow-y-auto
        max-h-[calc(100vh-260px)]
        grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">

        {isLoading && (
          <p className="text-sm text-muted-foreground col-span-full">
            Loading...
          </p>
        )}

        {!isLoading && data.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-6">
            No results found
          </p>
        )}

        {unselectedItems.map((entity) => (
          <AuthorityCard
            key={entity.id}
            entity={entity}
            isSelected={false}
            onToggle={toggle}
            onOpen={open}
          />
        ))}

      </div>

      {/* RESET */}
      <div className="flex justify-end">
        <button
          onClick={reset}
          className="text-xs text-primary"
        >
          Reset filters
        </button>
      </div>

    </div>
  );
}