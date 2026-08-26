"use client";

import Image from "next/image";
import { Info, CalendarDays, ListOrdered, FileText, Megaphone } from "lucide-react";

import VisibilitySelector from "@/components/space/VisibilitySelector";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TYPE_OPTIONS = [
  { value: "event", label: "Add an event", icon: CalendarDays },
  { value: "meeting", label: "Add a meeting", icon: ListOrdered },
  { value: "report", label: "Write a report", icon: FileText },
  { value: "update", label: "Post an update", icon: Megaphone },
];

export default function EditorHeader({
  mode = "post",
  profile,
  editor,
  spaces = [],
}) {
  const showTypeSelector = mode === "post" && !editor?.editorTypeLocked;
  const currentType = TYPE_OPTIONS.some((option) => option.value === editor?.type)
    ? editor.type
    : undefined;

  return (
    <TooltipProvider>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={profile?.avatar_url || "/user1.png"}
            width={34}
            height={34}
            className="shrink-0 rounded-full"
            alt=""
          />

          {mode === "post" && (
            <VisibilitySelector editor={editor} spaces={spaces} />
          )}
        </div>

        <div className="flex min-w-0 items-center gap-1">
          {showTypeSelector && (
            <ToggleGroup
              type="single"
              value={currentType}
              onValueChange={(value) => value && editor.setType(value)}
              className="gap-0"
            >
              {TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={option.value}
                        aria-label={option.label}
                        className="h-8 w-8 rounded-md p-0"
                      >
                        <Icon className="h-4 w-4" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {option.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hidden sm:inline-flex items-center justify-center text-muted-foreground">
                <Info className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Start typing for a regular action post.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
