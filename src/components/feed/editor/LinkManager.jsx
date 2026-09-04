"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

import { useLinkManager } from "@/hooks/editor/useLinkManager";

import LinkManagerDialog from "@/components/feed/editor/LinkManagerDialog";

export default function LinkManager({ value = [], onChange }) {
  const [open, setOpen] = useState(false);

  const {
    links,
    draft,
    setDraft,
    resolving,
    addLink,
    removeLink,
    moveLink,
    clearLinks,
  } = useLinkManager(value, onChange);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={links.length > 0 ? "secondary" : "ghost"}
              size="icon"
              className="relative shrink-0"
              onClick={() => setOpen(true)}
            >
              <Link2 className="h-5 w-5" />

              {links.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {links.length}
                </span>
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom">Manage links</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <LinkManagerDialog
        open={open}
        onOpenChange={setOpen}
        links={links}
        draft={draft}
        setDraft={setDraft}
        resolving={resolving}
        addLink={addLink}
        removeLink={removeLink}
        moveLink={moveLink}
        clearLinks={clearLinks}
      />
    </>
  );
}
