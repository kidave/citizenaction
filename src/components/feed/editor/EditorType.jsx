"use client";

import { EDITOR_TYPE_CONFIG } from "./editorTypes";

import {
  FileWarning,
  Bell,
  CalendarDays,
  Presentation,
} from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
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
      <ToggleGroup
        type="single"
        value={type}
        onValueChange={(value) => {
          if (value) setType(value);
        }}
        variant="outline"
        size="sm"
        className="shrink-0"
      >
        {TYPES.map((item) => {
          const Icon = item.icon;
          const config = EDITOR_TYPE_CONFIG[item.value];

          return (
            <Tooltip key={item.value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={item.value}
                  aria-label={config.label}
                  className="h-8 w-8 shrink-0 p-0"
                >
                  <Icon className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{config.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ToggleGroup>
    </TooltipProvider>
  );
}
