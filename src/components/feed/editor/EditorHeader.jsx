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
  documentMode = false,
}) {
  const isPost = mode === "post";

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 shrink-0 flex-wrap items-center gap-2 px-4 py-3 pr-12 sm:px-6">
      <Image
        src={profile?.avatar_url || "/user1.png"}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full"
        alt=""
      />

      {isPost && showTitle && (
        <Input
          placeholder={documentMode ? "Document title..." : "Post title..."}
          value={editor.title || ""}
          onChange={(event) => editor.setTitle(event.target.value)}
          aria-label={documentMode ? "Document title" : "Post title"}
          aria-required="true"
          className={`min-w-0 font-medium shadow-none focus-visible:ring-0 ${documentMode ? "order-3 basis-full rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-base leading-tight placeholder:text-muted-foreground/80 sm:order-none sm:basis-auto sm:flex-1 sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:text-3xl" : "order-3 basis-full border-none bg-transparent px-0 text-base sm:order-none sm:basis-auto sm:flex-1"}`}
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
