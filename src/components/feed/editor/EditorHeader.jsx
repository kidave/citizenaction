"use client";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import VisibilitySelector from "@/components/space/VisibilitySelector";
import GovernanceSelector from "@/components/governance/GovernanceSelector";

export default function EditorHeader({
  mode = "post",
  profile,
  editor,
  spaces = [],
  showTitle = true,
}) {
  const isPost = mode === "post";

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 px-4 py-3 pr-12">
      <Image
        src={profile?.avatar_url || "/user1.png"}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full"
        alt=""
      />

      {isPost && showTitle && (
        <Input
          placeholder="Post title..."
          value={editor.title || ""}
          onChange={(event) => editor.setTitle(event.target.value)}
          aria-label="Post title"
          aria-required="true"
          className="h-9 min-w-0 flex-1 border-none bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0"
        />
      )}

      {isPost && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <VisibilitySelector editor={editor} spaces={spaces} />
          <GovernanceSelector editor={editor} />
        </div>
      )}
    </div>
  );
}
