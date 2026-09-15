"use client";

import { CalendarPlus, ImagePlus, Link2, MapPinPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ACTIONS = [
  { value: "schedule", label: "Add schedule", icon: CalendarPlus },
  { value: "location", label: "Add location", icon: MapPinPlus },
  { value: "attachment", label: "Add attachment", icon: ImagePlus },
  { value: "link", label: "Add link", icon: Link2 },
];

export default function EditorType({ onAction }) {
  return (
    <TooltipProvider delayDuration={250}>
      <ButtonGroup
        aria-label="Post tools"
        className="ml-3 shrink-0 gap-1 rounded-lg border bg-muted/30 p-1"
      >
        {ACTIONS.map(({ value, label, icon: Icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={label}
                onClick={() => onAction?.(value)}
                className="h-8 w-8 rounded-md p-0 text-muted-foreground transition-all duration-150 hover:bg-background/90 hover:text-foreground hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <Icon className="size-4" strokeWidth={1.8} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </ButtonGroup>
    </TooltipProvider>
  );
}
