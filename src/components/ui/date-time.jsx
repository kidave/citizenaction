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
  const [open, setOpen] =
    useState(false);

  // =====================================================
  // DATE SELECT
  // =====================================================

  function handleDateSelect(
    selected
  ) {
    if (!selected) return;

    const updated =
      value
        ? new Date(value)
        : new Date();

    // preserve existing time
    updated.setFullYear(
      selected.getFullYear()
    );

    updated.setMonth(
      selected.getMonth()
    );

    updated.setDate(
      selected.getDate()
    );

    onDateChange(updated);

    if (mode === "date") {
      setOpen(false);
    }
  }

  // =====================================================
  // TIME CHANGE
  // =====================================================

  function handleTimeChange(e) {
    const [hours, minutes] =
      e.target.value.split(":");

    const updated =
      value
        ? new Date(value)
        : new Date();

    updated.setHours(
      Number(hours)
    );

    updated.setMinutes(
      Number(minutes)
    );

    updated.setSeconds(0);

    onDateChange(updated);
  }

  // =====================================================
  // LABEL
  // =====================================================

  function getLabel() {
    if (!value) {
      if (mode === "date") {
        return "Pick date";
      }

      if (mode === "time") {
        return "Pick time";
      }

      return "Pick date & time";
    }

    // DATE ONLY

    if (mode === "date") {
      return format(
        value,
        "PPP"
      );
    }

    // TIME ONLY

    if (mode === "time") {
      return format(
        value,
        "h:mm a"
      );
    }

    // DATETIME

    return format(
      value,
      "PPP h:mm a"
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >

      <PopoverTrigger asChild>

        <Button
          variant="outline"
          className="
            min-w-[220px]
            justify-start
            text-left
            font-normal
          "
        >
          {getLabel()}
        </Button>

      </PopoverTrigger>

      <PopoverContent
        className="
          w-auto
          p-3
          space-y-3
        "
        align="start"
      >

        {/* ================================================= */}
        {/* CALENDAR */}
        {/* ================================================= */}

        {(mode === "date" ||
          mode === "datetime") && (
            <Calendar
              mode="single"
              selected={value}
              onSelect={
                handleDateSelect
              }
              initialFocus
            />
          )}

        {/* ================================================= */}
        {/* TIME */}
        {/* ================================================= */}

        {(mode === "time" ||
          mode === "datetime") && (
            <div className="space-y-2">

              <label className="text-sm font-medium">
                Time
              </label>

              <input
                type="time"
                className="
                  w-full
                  rounded-md
                  border
                  bg-background
                  px-3
                  py-2
                  text-sm
                "
                value={
                  value
                    ? format(
                        value,
                        "HH:mm"
                      )
                    : ""
                }
                onChange={
                  handleTimeChange
                }
              />

            </div>
          )}

      </PopoverContent>

    </Popover>
  );
}