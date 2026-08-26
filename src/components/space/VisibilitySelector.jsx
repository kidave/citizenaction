"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, Globe2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SpaceExplorer from "@/components/space/SpaceExplorer";

export default function VisibilitySelector({ editor, spaces = [] }) {
  const [open, setOpen] = useState(false);

  const selectedSpaces = editor.spaces ?? [];
  const isGlobal = selectedSpaces.length === 0;

  const visibleSpaces = useMemo(() => selectedSpaces.slice(0, 2), [selectedSpaces]);
  const remainingCount = Math.max(selectedSpaces.length - visibleSpaces.length, 0);
  const primarySpace = selectedSpaces[0];

  const label = isGlobal
    ? "Global"
    : selectedSpaces.length === 1
      ? primarySpace?.name || "Space"
      : `${primarySpace?.name || "Space"} +${selectedSpaces.length - 1}`;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="h-8 max-w-[210px] gap-1.5 rounded-full px-2.5"
            >
              {isGlobal ? (
                <Globe2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <div className="flex shrink-0 -space-x-1">
                  {visibleSpaces.map((space) => (
                    <Avatar
                      key={space.id}
                      className="h-5 w-5 border border-background"
                    >
                      <AvatarImage src={space.logo_url} alt="" />
                      <AvatarFallback className="text-[9px]">
                        {space.name?.[0]?.toUpperCase() || "S"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              )}

              <span className="truncate text-xs font-medium">{label}</span>
              {remainingCount > 0 && (
                <span className="text-[10px] text-muted-foreground">+{remainingCount}</span>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isGlobal ? "Choose Spaces for this post" : "Change Spaces for this post"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SpaceExplorer
        open={open}
        onOpenChange={setOpen}
        spaces={spaces}
        selectedSpaces={selectedSpaces}
        setSelectedSpaces={editor.setSpaces}
      />
    </>
  );
}
