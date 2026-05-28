"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SpaceExplorer from "@/components/space/SpaceExplorer";

export default function PostVisibilitySelector({ editor, spaces = [] }) {
  const [open, setOpen] = useState(false);

  const isGlobal = editor.spaces.length === 0;

  const visibleSpaces = useMemo(() => {
    return editor.spaces.slice(0, 3);
  }, [editor.spaces]);

  const remainingCount = editor.spaces.length - 3;

  return (
    <>
      {/* CONTROL */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 gap-2 rounded-full px-2 hover:bg-muted/50"
      >
        {/* TOGGLE */}
        <Switch checked={isGlobal} />

        {/* SPACE AVATARS */}
        {!isGlobal && (
          <div className="flex-space-x-1">
            {visibleSpaces.map((space) => (
              <Avatar
                key={space.id}
                className="h-8 w-8 border border-background"
              >
                <AvatarImage src={space.logo_url} />

                <AvatarFallback className="text-[10px]">
                  {space.name?.[0]}
                </AvatarFallback>
              </Avatar>
            ))}

            {remainingCount > 0 && (
              <Avatar className="h-8 w-8 border border-background">
                <AvatarFallback className="text-[10px]">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}
      </Button>

      {/* EXPLORER */}
      <SpaceExplorer
        open={open}
        onOpenChange={setOpen}
        spaces={spaces}
        selectedSpaces={editor.spaces}
        setSelectedSpaces={editor.setSpaces}
      />
    </>
  );
}
