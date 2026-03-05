"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

export default function PostTypeSelector({ type, setType }) {

  return (
    <div className="flex justify-end">

      <ToggleGroup
        type="single"
        value={type}
        onValueChange={(v) => v && setType(v)}
        variant="outline"
      >

        <ToggleGroupItem
          value="action"
          className="rounded-none first:rounded-l-md border-r-0"
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="cursor-pointer">Action</span>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 text-sm">
              Document civic initiatives and actions taken.
            </HoverCardContent>
          </HoverCard>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="report"
          className="rounded-none border-r-0"
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="cursor-pointer">Report</span>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 text-sm">
              Document complaints or policy proposals submitted.
            </HoverCardContent>
          </HoverCard>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="meeting"
          className="rounded-none last:rounded-r-md"
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="cursor-pointer">Meeting</span>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 text-sm">
              Record meetings with officials.
            </HoverCardContent>
          </HoverCard>
        </ToggleGroupItem>

      </ToggleGroup>

    </div>
  );
}