"use client";

import Image from "next/image";

import VisibilitySelector from "@/components/space/VisibilitySelector";

export default function EditorHeader({
  mode = "post",
  profile,
  editor,
  spaces = [],
}) {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-3 px-4 py-3 pr-12">
      <Image
        src={profile?.avatar_url || "/user1.png"}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full"
        alt=""
      />

      {mode === "post" && (
        <VisibilitySelector editor={editor} spaces={spaces} />
      )}
    </div>
  );
}
