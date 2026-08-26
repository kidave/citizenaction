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
    <TooltipProvider delayDuration={250}>
      <ButtonGroup
        aria-label="Post type"
        className="ml-2 shrink-0 rounded-lg border bg-muted/30 p-0.5"
      >
        {TYPES.map(({ value, label, icon: Icon }) => {
          const selected = type === value;

          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => setType(value)}
                  className={[
                    "h-8 w-8 rounded-md p-0 transition-colors",
                    "hover:bg-background hover:text-foreground",
                    selected
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ButtonGroup>
    </TooltipProvider>
  );
}
