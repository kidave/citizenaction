"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import SpaceSelector from "@/components/shared/SpaceSelector";

export default function PostEditorContext({ editor, spaces = [] }) {

  const [openScope, setOpenScope] = useState(false);

  const safeEditor = editor || {};

  const {
    mode,
    setMode,
    space_id,
    setSpaceId,
    scope_type,
    setScopeType,
    scope_code,
    setScopeCode,
    scope_name,
    setScopeName,
  } = safeEditor;

  const mergedSpaces = useMemo(() => {
    if (!space_id) return spaces;

    const exists = spaces.some(
      (s) => String(s.id) === String(space_id)
    );

    if (exists) return spaces;

    return [
      {
        id: space_id,
        name: "Selected Space",
        logo_url: null,
      },
      ...spaces,
    ];
  }, [spaces, space_id]);

  /* ================= HANDLERS ================= */

  function handleSpaceChange(val) {
    if (!setMode) return;

    const parsed = val ? String(val) : null;

    setMode("space");
    setSpaceId?.(parsed);

    setScopeType?.(null);
    setScopeCode?.(null);
    setScopeName?.(null);
  }

  function handleScopeSave(val) {
    setScopeType?.(val?.scope_type || null);
    setScopeCode?.(val?.scope_code || null);
    setScopeName?.(val?.scope_name || null);
  }


  if (!editor) return null;
  if (mode === "global") return null;

  return (
    <>
      <div className="flex items-center gap-2 w-full">

        <SpaceSelector
          value={space_id || null}
          onChange={handleSpaceChange}
          spaces={mergedSpaces}
        />
        
        {/* 
        {space_id && (
          <button
            onClick={() => setOpenScope(true)}
            className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm w-full"
          >
            <Search size={14} />
            <span className="truncate">
              {scope_name || "Search location"}
            </span>
          </button>
        )}
        */}
      </div>
      
      {/* Scope Selector Modal 
      <ScopeSelectorModal
        open={openScope}
        onClose={() => setOpenScope(false)}
        value={{
          scope_type,
          scope_code,
          scope_name,
        }}
        onSave={handleScopeSave}
      />
      */}
    </>
  );
}