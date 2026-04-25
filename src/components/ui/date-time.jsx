"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateTimePicker({
  value,
  onDateChange,
  mode = "date",
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selected) => {
    if (!selected) return;

    onDateChange(selected); // ✅ ALWAYS return Date object
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left"
        >
          {value
            ? mode === "date"
              ? format(value, "PPP")
              : format(value, "HH:mm")
            : mode === "date"
            ? "Pick a date"
            : "Pick time"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        {mode === "date" ? (
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
          />
        ) : (
          <input
            type="time"
            className="p-2 border rounded-md"
            value={
              value
                ? format(value, "HH:mm")
                : ""
            }
            onChange={(e) => {
              const [h, m] = e.target.value.split(":");
              const newDate = new Date();
              newDate.setHours(h);
              newDate.setMinutes(m);
              onDateChange(newDate);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}