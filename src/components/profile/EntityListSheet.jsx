"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import Link from "next/link";

export default function EntityListSheet({
  open,
  onOpenChange,
  title = "People",
  items = [],
  type = "contributors",
}) {
  if (!items?.length) {
    return null;
  }

  const isContributors = type === "contributors";

  const uniqueItems = Array.from(
    new Map(
      items.map((item, index) => {
        const key =
          item.user_id ?? item.id ?? `${item.name ?? "unknown"}-${index}`;

        return [key, item];
      }),
    ).values(),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-hidden sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="mt-2 overflow-y-auto">
          <div className="space-y-2">
            {uniqueItems.map((item, index) => {
              /* =========================================
                 CONTRIBUTORS
              ========================================= */

              if (isContributors) {
                const avatar = item.avatar_url || item.avatar || null;

                const username = item.username || null;

                const key =
                  item.user_id ??
                  item.id ??
                  `${item.name ?? "unknown"}-${index}`;

                const content = (
                  <>
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={avatar || undefined} />

                      <AvatarFallback>
                        {item.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {item.name || "Anonymous"}
                      </div>

                      {username && (
                        <div className="truncate text-xs text-muted-foreground">
                          @{username}
                        </div>
                      )}
                    </div>
                  </>
                );

                if (username) {
                  return (
                    <Link
                      key={key}
                      href={`/user/${username}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-xl p-2"
                  >
                    {content}
                  </div>
                );
              }

              /* =========================================
                 GOVERNANCE / AUTHORITIES
              ========================================= */

              const key = item.id ?? `${item.label ?? "unknown"}-${index}`;

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={item.image_url || undefined} />

                    <AvatarFallback>
                      {item.label?.charAt(0)?.toUpperCase() || "G"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {item.label || "Unknown authority"}
                    </div>

                    {item.entity_type && (
                      <div className="text-xs text-muted-foreground">
                        {item.entity_type.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
