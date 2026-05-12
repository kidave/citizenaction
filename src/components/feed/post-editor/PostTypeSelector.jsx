"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const TYPES = [
  {
    value: "action",
    label: "Action",
    desc: "Document civic initiatives and actions taken.",
  },
  {
    value: "report",
    label: "Report",
    desc: "Document complaints, suggestions or policy proposals.",
  },
  {
    value: "update",
    label: "Update",
    desc: "Document major updates or announcements.",
  },
  {
    value: "event",
    label: "Event",
    desc: "Post event details and media.",
  },
  {
    value: "meeting",
    label: "Meeting",
    desc: "Record meetings with officials.",
  },
];

export default function PostTypeSelector({ type, setType }) {
  return (
    <div>

      <ToggleGroup
        type="single"
        value={type}
        onValueChange={(v) => v && setType(v)}
        variant="outline"
      >

        {TYPES.map((t, i) => (
          <ToggleGroupItem
            key={t.value}
            value={t.value}
            className={`rounded-none ${
              i === 0 ? "rounded-l-md" : ""
            } ${
              i === TYPES.length - 1 ? "rounded-r-md" : "border-r-0"
            }`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer">
                  {t.label}
                </span>
              </TooltipTrigger>

              <TooltipContent>
                <p className="text-xs max-w-[200px]">
                  {t.desc}
                </p>
              </TooltipContent>
            </Tooltip>
          </ToggleGroupItem>
        ))}

      </ToggleGroup>

    </div>
  );
}