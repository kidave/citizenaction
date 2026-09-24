"use client";

import { useState } from "react";
import { ChevronsUpDown, Globe2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SpaceExplorer from "@/components/space/SpaceExplorer";

export default function VisibilitySelector({ editor, spaces = [] }) {
  const [open, setOpen] = useState(false);
  const selectedSpaces = editor.spaces ?? [];
  const isGlobal = selectedSpaces.length === 0;
  const visibleSpaces = selectedSpaces.slice(0, 5);
  const remaining = Math.max(selectedSpaces.length - 5, 0);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} aria-label="Select spaces" title={isGlobal ? "Choose Spaces" : "Change Spaces"} className="h-8 gap-1.5 rounded-full px-2.5">
        {isGlobal ? (
          <Globe2 className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <div className="flex shrink-0 -space-x-1">
            {visibleSpaces.map((space) => (
              <Avatar key={space.id} className="h-5 w-5 border border-background">
                <AvatarImage src={space.logo_url} alt="" />
                <AvatarFallback className="text-[9px]">{space.name?.[0]?.toUpperCase() || "S"}</AvatarFallback>
              </Avatar>
            ))}
            {remaining > 0 && <Avatar className="h-5 w-5 border border-background"><AvatarFallback className="text-[8px]">+{remaining}</AvatarFallback></Avatar>}
          </div>
        )}
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Button>
      <SpaceExplorer open={open} onOpenChange={setOpen} spaces={spaces} selectedSpaces={selectedSpaces} setSelectedSpaces={editor.setSpaces} />
    </>
  );
}
