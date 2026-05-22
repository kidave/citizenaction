"use client";

import {
  Orbit,
  FileWarning,
  Bell,
  CalendarDays,
  Presentation,
} from "lucide-react";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const TYPES = [
  {
    value: "action",
    label: "Action",
    icon: Orbit,
    desc: "Document civic initiatives and actions taken.",
  },
  {
    value: "report",
    label: "Report",
    icon: FileWarning,
    desc: "Document complaints, suggestions or policy proposals.",
  },
  {
    value: "update",
    label: "Update",
    icon: Bell,
    desc: "Document major updates or announcements.",
  },
  {
    value: "event",
    label: "Event",
    icon: CalendarDays,
    desc: "Post event details and media.",
  },
  {
    value: "meeting",
    label: "Meeting",
    icon: Presentation,
    desc: "Record meetings with officials.",
  },
];

export default function PostTypeSelector({
  type,
  setType,
}) {
  return (
    <div
      className="
        w-full
        overflow-x-auto
        scrollbar-hide
      "
    >

      <ToggleGroup
        type="single"
        value={type}
        onValueChange={(v) =>
          v && setType(v)
        }
        variant="outline"
        className="
          w-max
          min-w-max
          justify-start
          flex-nowrap
        "
      >

        {TYPES.map((t, i) => {
          const Icon = t.icon;

          return (
            <ToggleGroupItem
              key={t.value}
              value={t.value}
              className={`
                rounded-none
                gap-2
                shrink-0

                ${
                  i === 0
                    ? "rounded-l-md"
                    : ""
                }

                ${
                  i === TYPES.length - 1
                    ? "rounded-r-md"
                    : "border-r-0"
                }
              `}
            >

              <Tooltip>

                <TooltipTrigger asChild>

                  <span
                    className="
                      flex
                      items-center
                      gap-2
                      cursor-pointer
                      whitespace-nowrap
                    "
                  >

                    <Icon className="h-4 w-4 shrink-0" />

                    <span>
                      {t.label}
                    </span>

                  </span>

                </TooltipTrigger>

                <TooltipContent>

                  <p className="text-xs max-w-[200px]">
                    {t.desc}
                  </p>

                </TooltipContent>

              </Tooltip>

            </ToggleGroupItem>
          );
        })}

      </ToggleGroup>

    </div>
  );
}