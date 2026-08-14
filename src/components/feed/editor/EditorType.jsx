"use client";

import { EDITOR_TYPE_CONFIG } from "./editorTypes";

import {
  Orbit,
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
} from "@/components/ui/tooltip";

const TYPES = [
  {
    value: "action",
    icon: Orbit,
  },
  {
    value: "report",
    icon: FileWarning,
  },
  {
    value: "update",
    icon: Bell,
  },
  {
    value: "event",
    icon: CalendarDays,
  },
  {
    value: "meeting",
    icon: Presentation,
  },
];

export default function EditorType({ type, setType }) {
  return (
    <div className="scrollbar-hide w-full overflow-x-auto">
      <ToggleGroup
        type="single"
        value={type}
        onValueChange={(value) => {
          if (value) {
            setType(value);
          }
        }}
        variant="outline"
        className="w-max min-w-max flex-nowrap justify-start"
      >
        {TYPES.map((item, index) => {
          const Icon = item.icon;
          const config = EDITOR_TYPE_CONFIG[item.value];

          return (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className={`shrink-0 gap-2 rounded-none ${
                index === 0 ? "rounded-l-md" : ""
              } ${index === TYPES.length - 1 ? "rounded-r-md" : "border-r-0"}`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
                    <Icon className="h-4 w-4 shrink-0" />

                    <span>{config.label}</span>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="max-w-[200px] text-xs">{config.placeholder}</p>
                </TooltipContent>
              </Tooltip>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
