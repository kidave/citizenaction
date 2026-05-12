"use client";

import SpaceSelectorDrawer from "@/components/space/SpaceSelectorDrawer";
import PostTypeSelector from "@/components/feed/post-editor/PostTypeSelector";

export default function PostEditorContextRow({
  editor,
  spaces = [],
}) {

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        flex-wrap
      "
    >

      {/* LEFT */}
      <div
        className="
          flex
          items-center
          gap-2
          flex-wrap
        "
      >

        {/* TYPE */}
        <PostTypeSelector
          type={editor.type}
          setType={editor.setType}
        />

        {/* SPACES */}
        {!editor.is_global && (
          <SpaceSelectorDrawer
            spaces={spaces}
            selectedSpaces={
              editor.spaces
            }
            setSelectedSpaces={
              editor.setSpaces
            }
          />
        )}

      </div>

      {/* RIGHT */}
      <div
        className="
          flex
          items-center
          gap-2
          flex-wrap
          justify-end
        "
      >

        {editor.governance_entities
          ?.slice(0, 3)
          ?.map((entity) => (
            <div
              key={entity.id}
              className="
                px-3
                py-1
                rounded-full
                border
                bg-muted/40
                text-sm
              "
            >
              {entity.name}
            </div>
          ))}

      </div>

    </div>
  );
}