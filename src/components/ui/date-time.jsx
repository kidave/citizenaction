"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateTimePicker({ value, onDateChange, mode = "datetime" }) {
  const [open, setOpen] = React.useState(false);

  const date = value ? new Date(value) : undefined;

  // =====================================================
  // DATE
  // =====================================================

  function handleDateSelect(selectedDate) {
    if (!selectedDate) return;

    const updated = date ? new Date(date) : new Date();

    updated.setFullYear(selectedDate.getFullYear());

    updated.setMonth(selectedDate.getMonth());

    updated.setDate(selectedDate.getDate());

    onDateChange(updated);

    setOpen(false);
  }

  // =====================================================
  // TIME
  // =====================================================

  function handleTimeChange(event) {
    const [hours, minutes] = event.target.value.split(":");

    const updated = date ? new Date(date) : new Date();

    updated.setHours(Number(hours));
    updated.setMinutes(Number(minutes));
    updated.setSeconds(0);
    updated.setMilliseconds(0);

    onDateChange(updated);
  }

  // =====================================================
  // DATE LABEL
  // =====================================================

  function getDateLabel() {
    if (!date) {
      return "Select date";
    }

    return format(date, "PPP");
  }

  // =====================================================
  // TIME VALUE
  // =====================================================

  function getTimeValue() {
    if (!date) return "";

    return format(date, "HH:mm");
  }

  // =====================================================
  // DATE ONLY
  // =====================================================

  if (mode === "date") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {getDateLabel()}

            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            defaultMonth={date}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // =====================================================
  // TIME ONLY
  // =====================================================

  if (mode === "time") {
    return (
      <input
        type="time"
        value={getTimeValue()}
        onChange={handleTimeChange}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    );
  }

  // =====================================================
  // DATE + TIME
  // =====================================================

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* Date */}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {getDateLabel()}

            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            defaultMonth={date}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      {/* Time */}

      <input
        type="time"
        value={getTimeValue()}
        onChange={handleTimeChange}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
