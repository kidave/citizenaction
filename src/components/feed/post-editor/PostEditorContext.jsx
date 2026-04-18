"use client";

import { useEffect, useMemo } from "react";

import ScopeSelector from "@/components/shared/ScopeSelector";
import SpaceSelector from "@/components/shared/SpaceSelector";

export default function PostEditorContext({
  space_id,
  setSpaceId,

  scope_type,
  setScopeType,
  scope_code,
  setScopeCode,

  isGlobal,

  spaces = [],
}) {
  /* -------------------------
     HANDLE GLOBAL
  ------------------------- */
  useEffect(() => {
    if (isGlobal) {
      setSpaceId(null);
      setScopeType(null);
      setScopeCode(null);
    }
  }, [isGlobal, setSpaceId, setScopeType, setScopeCode]);

  /* -------------------------
     MERGE SPACES
  ------------------------- */
  const mergedSpaces = useMemo(() => {
    if (!space_id) return spaces;

    const exists = spaces.some(
      (s) => String(s.id) === String(space_id)
    );

    if (exists) return spaces;

    return [
      ...spaces,
      {
        id: space_id,
        name: "Selected Space",
        logo_url: null,
      },
    ];
  }, [spaces, space_id]);

  /* -------------------------
     HANDLERS
  ------------------------- */
  function handleScopeChange(val) {
    setScopeType(val?.scope_type || null);
    setScopeCode(val?.scope_code || null);
  }

  function handleSpaceChange(val) {
    setSpaceId(val || null);
  }

  /* -------------------------
     UI
  ------------------------- */
  if (isGlobal) return null;

  return (
    <div className="space-y-3">

      {/* 🔥 Responsive Layout */}
      <div className="flex flex-col gap-3 md:flex-row">

        {/* SPACE */}
        <div className="w-full md:w-[30%]">
          <SpaceSelector
            value={space_id}
            onChange={handleSpaceChange}
            spaces={mergedSpaces}
          />
        </div>

        {/* SCOPE */}
        <div className="w-full md:flex-1 min-w-0">
          <ScopeSelector
            value={{
              scope_type,
              scope_code,
            }}
            onChange={handleScopeChange}
          />
        </div>

      </div>

    </div>
  );
}