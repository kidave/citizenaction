"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import VisibilitySelector from "@/components/space/VisibilitySelector";
import GovernanceSelector from "@/components/governance/GovernanceSelector";

export default function EditorHeader({
  profile,
  editor,
  spaces = [],
  showTitle = true,
  showSelectors = true,
  titlePlaceholder = "Post title...",
  titleAriaLabel = "Post title",
  documentStyle = false,
}) {
  return (
    <div
      className={`mx-auto flex w-full min-w-0 shrink-0 flex-wrap items-center gap-2 py-3 ${
        documentStyle ? "max-w-4xl px-0 pr-0 sm:px-0" : "max-w-6xl px-4 pr-12 sm:px-6"
      }`}
    >
      <Image
        src={profile?.avatar_url || "/user1.png"}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full"
        alt=""
      />

      {showTitle && (
        <Input
          placeholder={titlePlaceholder}
          value={editor.title || ""}
          onChange={(event) => editor.setTitle(event.target.value)}
          aria-label={titleAriaLabel}
          aria-required="true"
          className={`min-w-0 font-medium shadow-none focus-visible:ring-0 ${
            documentStyle
              ? "order-3 basis-full border-y-0 border-r-0 border-l-4 border-primary rounded-none bg-transparent pl-3 pr-0 py-1 font-serif text-2xl leading-snug tracking-tight placeholder:text-muted-foreground/70 sm:order-none sm:basis-auto sm:flex-1 sm:py-0 sm:text-4xl"
              : "order-3 basis-full border-none bg-transparent px-0 text-base sm:order-none sm:basis-auto sm:flex-1"
          }`}
        />
      )}

      {showSelectors && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <VisibilitySelector editor={editor} spaces={spaces} />
          <GovernanceSelector editor={editor} />
        </div>
      )}
    </div>
  );
}
