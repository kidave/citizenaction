"use client";

import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

    if (editor.start_at) {
      items.push(`Starts: ${new Date(editor.start_at).toLocaleString()}`);
    }

    if (editor.end_at) {
      items.push(`Ends: ${new Date(editor.end_at).toLocaleString()}`);
    }

    return items.length ? items : ["Set date & time"];
  }, [editor.start_at, editor.end_at]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant={
                  editor.start_at || editor.end_at ? "secondary" : "ghost"
                }
                size="icon"
              >
                <CalendarDays className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>

          <TooltipContent side="bottom" align="start">
            <div className="space-y-1 text-xs">
              {contextSummary.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="top-[4%] flex max-h-[92vh] min-h-[520px] w-[calc(100%-2rem)] translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle>Event date & time</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 p-5">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">When did / will this happen?</div>
                <p className="mt-1 text-xs text-muted-foreground">Use this for the event, incident, meeting, or activity described by the post. It does not schedule publication.</p>
              </div>
              <div className="text-sm font-medium">Start</div>
              <DateTimePicker
                value={editor.start_at ? new Date(editor.start_at) : null}
                onDateChange={(nextValue) =>
                  editor.setStartAt(nextValue ? nextValue.toISOString() : null)
                }
                mode="datetime"
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">End <span className="font-normal text-muted-foreground">(optional)</span></div>
              <DateTimePicker
                value={editor.end_at ? new Date(editor.end_at) : null}
                onDateChange={(nextValue) =>
                  editor.setEndAt(nextValue ? nextValue.toISOString() : null)
                }
                mode="datetime"
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-between border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              editor.setStartAt(null);
              editor.setEndAt(null);
            }}
          >
            Clear
          </Button>

          <Button type="button" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
