"use client";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import VisibilitySelector from "@/components/space/VisibilitySelector";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";

export default function EditorHeader({
  mode = "post",
  profile,
  editor,
  spaces = [],
  showTitle = true,
}) {
  const isPost = mode === "post";
  const selectedSpaces = Array.isArray(editor?.spaces) ? editor.spaces : [];
  const selectedGovernance = Array.isArray(editor?.governance)
    ? editor.governance
    : [];

  return (
    <div className="shrink-0 border-b border-border/60 bg-background px-4 py-3 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
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
          <div className="ml-auto shrink-0">
            <VisibilitySelector editor={editor} spaces={spaces} />
          </div>
        )}
      </div>

      {(selectedSpaces.length > 0 || selectedGovernance.length > 0) && (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-4 pl-12 text-xs text-muted-foreground">
          {selectedSpaces.length > 0 && (
            <div className="flex items-center gap-2">
              <span>Spaces</span>
              <SpaceAvatarGroup spaces={selectedSpaces} />
            </div>
          )}

          {selectedGovernance.length > 0 && (
            <div className="flex items-center gap-2">
              <span>Referenced</span>
              <GovernanceAvatarGroup authorities={selectedGovernance} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
