"use client";

import SpaceSelector from "@/components/shared/SpaceSelector";

export default function PostEditorContext({
  editor,
  spaces = [],
}) {

  if (!editor) return null;

  if (editor.is_global) {
    return null;
  }

  return (
    <div className="w-full">

      <SpaceSelector
        value={editor.space_id}
        onChange={(val) => {
          editor.setSpaceId(val);
        }}
        spaces={spaces}
      />

    </div>
  );
}