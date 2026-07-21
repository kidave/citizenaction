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
    <div className="border-b p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={profile?.avatar_url || "/user1.png"}
              width={34}
              height={34}
              className="shrink-0 rounded-full"
              alt=""
            />

            <div className="truncate text-sm font-medium">{profile?.name}</div>
          </div>

          {mode === "post" && (
            <VisibilitySelector editor={editor} spaces={spaces} />
          )}
        </div>
      </div>
    </div>
  );
}
