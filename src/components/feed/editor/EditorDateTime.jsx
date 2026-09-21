"use client";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function toLocalDateTimeValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (number) => String(number).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoValue(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function EditorDateTime({ editor }) {
  const hasStart = Boolean(editor.start_at);
  const hasEnd = Boolean(editor.end_at);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={hasStart || hasEnd ? "secondary" : "ghost"}
          size="icon"
          className="shrink-0"
          aria-label={hasStart || hasEnd ? "Edit event date and time" : "Add event date and time"}
        >
          <CalendarDays className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-3">
          <div className="text-sm font-semibold">Date & time</div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="event-start" className="text-xs font-medium">
              Start
            </label>
            <Input
              id="event-start"
              type="datetime-local"
              value={toLocalDateTimeValue(editor.start_at)}
              onChange={(event) =>
                editor.setStartAt(toIsoValue(event.target.value))
              }
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="event-end" className="text-xs font-medium">
              End
            </label>
            <Input
              id="event-end"
              type="datetime-local"
              min={toLocalDateTimeValue(editor.start_at)}
              value={toLocalDateTimeValue(editor.end_at)}
              disabled={!hasStart}
              onChange={(event) =>
                editor.setEndAt(toIsoValue(event.target.value))
              }
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-between border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.setStartAt(null);
              editor.setEndAt(null);
            }}
          >
            Clear
          </Button>

          <Button type="button" size="sm">
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
