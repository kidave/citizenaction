"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Card } from "@/components/ui/card";

export default function GovernanceAvatarGroups({
  entities = [],
  maxVisible = 5,
}) {
  const [open, setOpen] = useState(false);

  if (!entities || entities.length === 0) return null;

  /* -------------------------
     DEDUPE AUTHORITIES
  ------------------------- */
  const uniqueEntities = Array.from(
    new Map(entities.map((e) => [e.id, e])).values(),
  );

  const visible = uniqueEntities.slice(0, maxVisible);
  const hiddenCount = uniqueEntities.length - maxVisible;

  return (
    <TooltipProvider>
      <>
        {/* ================= AVATAR GROUP ================= */}
        <div className="flex items-center">
          <AvatarGroup>
            {visible.map((entity) => (
              <Tooltip key={entity.id}>
                <TooltipTrigger asChild>
                  <Avatar
                    className="h-7 w-7 transition-all hover:z-20 hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AvatarImage src={entity.image_url} />
                    <AvatarFallback>
                      {entity.label?.charAt(0) || "G"}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>

                <TooltipContent>
                  <div className="text-xs font-medium">{entity.label}</div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* +COUNT */}
            {hiddenCount > 0 && (
              <Avatar
                className="h-7 w-7 cursor-pointer bg-muted text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                <AvatarFallback>+{hiddenCount}</AvatarFallback>
              </Avatar>
            )}
          </AvatarGroup>
        </div>

        {/* ================= FULL LIST MODAL ================= */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tagged Authorities</DialogTitle>
            </DialogHeader>

            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {uniqueEntities.map((entity) => (
                <Card key={entity.id} className="flex items-center gap-3 p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={entity.image_url} />
                    <AvatarFallback>
                      {entity.label?.charAt(0) || "G"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="text-sm font-medium">{entity.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {entity.entity_type?.toUpperCase()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
}
