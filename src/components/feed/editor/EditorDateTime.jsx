"use client";

import { useMemo, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

import { DateTimePicker } from "@/components/ui/date-time";

import { CalendarDays } from "lucide-react";

export default function EditorDateTime({ editor }) {
  const [open, setOpen] = useState(false);

  const contextSummary = useMemo(() => {
    const items = [];

    if (editor.start_at)
      items.push(`Starts: ${new Date(editor.start_at).toLocaleString()}`);

    if (editor.end_at)
      items.push(`Ends: ${new Date(editor.end_at).toLocaleString()}`);

    return items.length ? items : ["Set date & time"];
  }, [editor.start_at, editor.end_at]);

  const fields = [
    {
      label: "Starts",
      value: editor.start_at,
      setter: editor.setStartAt,
    },
    {
      label: "Ends",
      value: editor.end_at,
      setter: editor.setEndAt,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <CalendarDays className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>

          <TooltipContent side="bottom" align="start">
            <div className="space-y-1 text-xs">
              {contextSummary.map((item, i) => (
                <div key={i}>{item}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="top-[8%] translate-y-0 overflow-visible p-0 sm:max-w-2xl">
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          {fields.map(({ label, value, setter }) => (
            <div key={label} className="space-y-2">
              <div className="text-xs text-muted-foreground">{label}</div>

              <DateTimePicker
                value={value ? new Date(value) : null}
                onDateChange={(v) => setter(v?.toISOString() || null)}
                mode="datetime"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t px-5 py-4">
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
