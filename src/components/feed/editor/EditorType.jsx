"use client";

import { Bell, CalendarDays, FileText, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TYPES = [
  { value: "report", label: "Write a report", icon: FileText },
  { value: "update", label: "Post an update", icon: Bell },
  { value: "event", label: "Add an event", icon: CalendarDays },
  { value: "meeting", label: "Add a meeting", icon: ListOrdered },
];

export default function EditorType({ type, setType }) {
  return (
    <TooltipProvider>
      <ButtonGroup aria-label="Post type" className="shrink-0">
        {TYPES.map(({ value, label, icon: Icon }) => {
          const selected = type === value;

          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={selected ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => setType(value)}
                  className="shrink-0"
                >
                  <Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ButtonGroup>
    </TooltipProvider>
  );
}
