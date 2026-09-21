"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";
import { Input } from "@/components/ui/input";
import VisibilitySelector from "@/components/space/VisibilitySelector";

function AvatarGroup({ items = [], kind }) {
  if (!items.length) return null;

  const visible = items.slice(0, 4);
  const remaining = Math.max(items.length - visible.length, 0);

  return (
    <div className="flex items-center">
      {visible.map((item, index) => {
        const label =
          kind === "space"
            ? item?.name || "Space"
            : getGovernanceLabel(item);

        const image =
          kind === "space"
            ? item?.image_url || item?.avatar_url || item?.logo_url
            : item?.image_url;

        const href = kind === "governance" ? getGovernanceHref(item) : null;

        const avatar = (
          <div
            key={item?.id || label}
            className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm"
            style={{ marginLeft: index === 0 ? 0 : -8, zIndex: visible.length - index }}
            title={label}
          >
            {image ? (
              <Image
                src={image}
                alt=""
                fill
                sizes="28px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-muted-foreground">
                {label.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );

        if (href) {
          return (
            <Link
              key={item?.id || label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {avatar}
            </Link>
          );
        }

        return avatar;
      })}

      {remaining > 0 && (
        <div
          className="relative ml-[-8px] flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-muted px-1 text-[10px] font-medium text-muted-foreground"
          title={items
            .slice(visible.length)
            .map((item) =>
              kind === "space" ? item?.name : getGovernanceLabel(item),
            )
            .join(", ")}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default function EditorHeader({
  mode = "post",
  profile,
  editor,
  spaces = [],
  showTitle = true,
}) {
  const isPost = mode === "post";
  const selectedSpaces = Array.isArray(editor?.spaces)
    ? editor.spaces
    : spaces.filter((space) => editor?.spaces?.some?.((item) => item.id === space.id));
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
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 pl-12 text-xs text-muted-foreground">
          {selectedSpaces.length > 0 && (
            <div className="flex items-center gap-2">
              <span>Spaces</span>
              <AvatarGroup items={selectedSpaces} kind="space" />
            </div>
          )}

          {selectedGovernance.length > 0 && (
            <div className="flex items-center gap-2">
              <span>Referenced</span>
              <AvatarGroup items={selectedGovernance} kind="governance" />
              <ExternalLink className="h-3 w-3 opacity-50" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
