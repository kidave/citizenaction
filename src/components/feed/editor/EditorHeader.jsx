"use client";

import Image from "next/image";

import VisibilitySelector from "@/components/space/VisibilitySelector";
import EditorType from "./EditorType";

export default function EditorHeader({
  mode = "post",
  profile,
  editor,
  spaces = [],
}) {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 border-b px-3 py-2 pr-12 sm:pr-12">
      <Image
        src={profile?.avatar_url || "/user1.png"}
        width={34}
        height={34}
        className="shrink-0 rounded-full"
        alt=""
      />

      {mode === "post" && (
        <VisibilitySelector editor={editor} spaces={spaces} />
      )}

      {mode === "post" && !editor?.editorTypeLocked && (
        <div className="ml-auto min-w-0">
          <EditorType type={editor.type} setType={editor.setType} compact />
        </div>
      )}
    </div>
  );
}
