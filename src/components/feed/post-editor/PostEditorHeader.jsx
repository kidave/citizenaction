"use client";

import Image from "next/image";
import PostVisibilitySelector from "@/components/space/PostVisibilitySelector";

export default function PostEditorHeader({
  profile,
  post,
  editor,
  spaces = [],
}) {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between gap-3">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* USER */}
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

          {/* VISIBILITY */}
          <PostVisibilitySelector editor={editor} spaces={spaces} />
        </div>
      </div>
    </div>
  );
}
