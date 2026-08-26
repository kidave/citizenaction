"use client";

import { EDITOR_TYPE_CONFIG } from "./editorTypes";

import {
  Bell,
  CalendarDays,
  FileWarning,
  Presentation,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TYPES = [
  { value: "report", icon: FileWarning },
  { value: "update", icon: Bell },
  { value: "event", icon: CalendarDays },
  { value: "meeting", icon: Presentation },
];

export default function EditorType({ type, setType }) {
  return (
    <TooltipProvider>
      <ButtonGroup aria-label="Post type">
        {TYPES.map((item) => {
          const Icon = item.icon;
          const config = EDITOR_TYPE_CONFIG[item.value];
          const selected = type === item.value;

          return (
            <Tooltip key={item.value}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={selected ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-label={config.label}
                  aria-pressed={selected}
                  onClick={() => setType(item.value)}
                  className="shrink-0"
                >
                  <Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{config.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ButtonGroup>
    </TooltipProvider>
  );
}
