"use client";

import {
  Megaphone,
  CalendarDays,
  ListOrdered,
  FileText,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OPTIONS = [
  {
    value: "event",
    label: "Add an event",
    icon: CalendarDays,
  },
  {
    value: "meeting",
    label: "Add a meeting",
    icon: ListOrdered,
  },
  {
    value: "report",
    label: "Write a report",
    icon: FileText,
  },
  {
    value: "update",
    label: "Post an update",
    icon: Megaphone,
  },
];

export default function PostTypeChooser({ value, onChange }) {
  return (
    <div className="flex items-center justify-end gap-1 border-b bg-muted/20 px-3 py-2">
      <TooltipProvider delayDuration={250}>
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={option.label}
                  aria-pressed={selected}
                  onClick={() => onChange(option.value)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-background hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{option.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
