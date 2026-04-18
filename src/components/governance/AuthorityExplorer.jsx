"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import AuthorityCard from "./AuthorityCard";

import ScopeSelector from "@/components/shared/ScopeSelector";

import { useAuthorityExplorer } from "@/hooks/governance/useAuthorityExplorer";
import { useGovernanceTree } from "@/hooks/governance/useGovernanceTree";
import { useScopeChain } from "@/hooks/geography/useScopeChain";

/* -------------------------
   PRIORITY ORDER
------------------------- */
const SCOPE_PRIORITY = [
  "ward",
  "city",
  "region",
  "state",
  "country",
];

function getScopePriority(type) {
  return SCOPE_PRIORITY.indexOf(type);
}

export default function AuthorityExplorer({
  selected = [],
  onChange,
  context,
}) {
  const {
    search,
    setSearch,
    scope,
    setScope,
    stack,
    setStack,
    reset,
  } = useAuthorityExplorer();

  /* -------------------------
     🧠 DIRTY STATE (CRITICAL FIX)
  ------------------------- */
  const [isUserModifiedScope, setIsUserModifiedScope] = useState(false);

  /* -------------------------
     RESET WHEN CONTEXT CHANGES
  ------------------------- */
  useEffect(() => {
    setIsUserModifiedScope(false);
  }, [context?.scope_code]);

  /* -------------------------
     SYNC CONTEXT → SCOPE
  ------------------------- */
  useEffect(() => {
    if (!context) return;

    // Do not override if user changed manually
    if (isUserModifiedScope) return;

    if (context.scope_type && context.scope_code) {
      setScope({
        scope_type: context.scope_type,
        scope_code: context.scope_code,
      });
    }

    if (context.isGlobal) {
      setScope({
        scope_type: "country",
        scope_code: "IN",
      });
    }
  }, [context, isUserModifiedScope, setScope]);

  /* -------------------------
     CURRENT NODE
  ------------------------- */
  const currentParent = stack[stack.length - 1] || null;

  /* -------------------------
     EFFECTIVE SCOPE (MEMO FIX)
  ------------------------- */
  const effectiveScope = useMemo(
    () => ({
      type: scope?.scope_type || "country",
      code: scope?.scope_code || "IN",
    }),
    [scope?.scope_type, scope?.scope_code]
  );

  /* -------------------------
     FETCH FULL CHAIN
  ------------------------- */
  const { data: chain } = useScopeChain(effectiveScope.code);

  /* -------------------------
     BUILD SCOPES ARRAY
  ------------------------- */
  const scopes = useMemo(() => {
    /* -------------------------
       NO SCOPE SELECTED
       → ALL STATES + COUNTRY
    ------------------------- */
    if (!effectiveScope.code || effectiveScope.type === "country") {
      return [
        { type: "state", code: null }, // ALL STATES
        { type: "country", code: "IN" },
      ];
    }

    /* -------------------------
       NORMAL CHAIN
    ------------------------- */
    if (!chain) return [];

    return Object.entries(chain).map(([type, code]) => ({
      type,
      code,
    }));
  }, [chain, effectiveScope]);

  /* -------------------------
     FETCH DATA
  ------------------------- */
  const { data = [], isLoading } = useGovernanceTree({
    parentId: search ? null : currentParent?.id,
    scopes,
    search,
  });

  /* -------------------------
     TOGGLE
  ------------------------- */
  function toggle(entity) {
    const exists = selected.find((e) => e.id === entity.id);

    if (exists) {
      onChange(selected.filter((e) => e.id !== entity.id));
    } else {
      onChange([...selected, entity]);
    }
  }

  /* -------------------------
     NAVIGATION
  ------------------------- */
  function open(entity) {
    if (entity.entity_type !== "person") {
      setStack((prev) => [...prev, entity]);
    }
  }

  /* -------------------------
     RANKING
  ------------------------- */
  const ranked = useMemo(() => {
    return [...data].sort((a, b) => {
      return (
        getScopePriority(a.geo_scope_type) -
        getScopePriority(b.geo_scope_type)
      );
    });
  }, [data]);

  /* -------------------------
     GROUPING
  ------------------------- */
  const selectedIds = new Set(selected.map((e) => e.id));

  const selectedItems = selected;

  const unselectedItems = ranked.filter(
    (e) => !selectedIds.has(e.id)
  );

  function handleReset() {
    setSearch("");
    setStack([]);

    setScope({
      scope_type: null,
      scope_code: null,
    });

    setIsUserModifiedScope(false);
  }

  /* -------------------------
     UI
  ------------------------- */
  return (
    <div className="space-y-3">

      {/* ================= SEARCH + SCOPE ================= */}
      <div className="space-y-2">

        <Input
          placeholder="Search authority, dept, person..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ScopeSelector
          value={{
            scope_type: scope?.scope_type,
            scope_code: scope?.scope_code,
          }}
          onChange={(val) => {
            const isCleared = !val?.scope_code;

            setIsUserModifiedScope(!isCleared);

            setScope({
              scope_type: val?.scope_type || null,
              scope_code: val?.scope_code || null,
            });
          }}
        />

      </div>

      {/* ================= SELECTED ================= */}
      {selectedItems.length > 0 && (
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
      )}

      {/* ================= LIST ================= */}
      <div className="grid gap-2 overflow-y-auto max-h-[400px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">

        {isLoading && (
          <p className="text-sm text-muted-foreground col-span-full">
            Loading...
          </p>
        )}

        {!isLoading && ranked.length === 0 && (
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

      {/* ================= RESET ================= */}
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="text-xs text-primary"
        >
          Reset filters
        </button>
      </div>

    </div>
  );
}