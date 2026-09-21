"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();

function getDateParts(value) {
  if (!value) return { year: "", month: "", day: "" };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { year: "", month: "", day: "" };

  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1),
    day: String(date.getDate()),
  };
}

function toIsoValue(year, month, day) {
  if (!year) return null;

  const monthNumber = Number(month) || 1;
  const dayNumber = Number(day) || 1;
  const date = new Date(Number(year), monthNumber - 1, dayNumber, 12, 0, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatActionDate(value, precision = "date") {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (precision === "year") {
    return new Intl.DateTimeFormat("en-IN", { year: "numeric" }).format(date);
  }

  if (precision === "month") {
    return new Intl.DateTimeFormat("en-IN", {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ActionDatePicker({
  value,
  precision = "date",
  onChange,
  showLabel = false,
}) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const dateParts = useMemo(() => getDateParts(value), [value]);

  useEffect(() => {
    if (!open) return;

    setYear(dateParts.year);
    setMonth(precision === "year" ? "" : dateParts.month);
    setDay(precision === "date" ? dateParts.day : "");
  }, [open, dateParts.day, dateParts.month, dateParts.year, precision]);

  const daysInMonth = useMemo(() => {
    if (!year || !month) return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  }, [year, month]);

  const years = useMemo(
    () =>
      Array.from(
        { length: currentYear + 10 - (currentYear - 100) + 1 },
        (_, index) => currentYear - 100 + index,
      ),
    [],
  );

  function handleMonthChange(nextMonth) {
    const normalized = nextMonth === "none" ? "" : nextMonth;
    setMonth(normalized);

    if (!normalized) {
      setDay("");
      return;
    }

    if (
      day &&
      Number(day) > new Date(Number(year), Number(normalized), 0).getDate()
    ) {
      setDay("");
    }
  }

  function handleDone() {
    if (!year) return;

    const nextPrecision = day ? "date" : month ? "month" : "year";
    const nextValue = toIsoValue(year, month, day);

    onChange?.({
      value: nextValue,
      precision: nextPrecision,
    });

    setOpen(false);
  }

  const hasValue = Boolean(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={hasValue ? "secondary" : "ghost"}
          size={showLabel ? "sm" : "icon"}
          className={showLabel ? "gap-1.5" : "shrink-0"}
          aria-label={hasValue ? "Edit action date" : "Add action date"}
        >
          <CalendarDays className="h-4 w-4" />
          {showLabel && (
            <span>
              {hasValue ? formatActionDate(value, precision) : "Add date"}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[300px] p-3">
        <div className="mb-3">
          <div className="text-sm font-semibold">Action date</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Use only the precision you know.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_1.25fr_0.8fr] gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-9 px-2.5 text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={month || "none"} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-9 px-2.5 text-xs">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any month</SelectItem>
              {MONTHS.map((name, index) => (
                <SelectItem key={name} value={String(index + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={day || "none"}
            onValueChange={(nextDay) =>
              setDay(nextDay === "none" ? "" : nextDay)
            }
            disabled={!month}
          >
            <SelectTrigger className="h-9 px-2.5 text-xs">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any day</SelectItem>
              {Array.from(
                { length: daysInMonth },
                (_, index) => index + 1,
              ).map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setYear("");
              setMonth("");
              setDay("");
              onChange?.({ value: null, precision: null });
              setOpen(false);
            }}
          >
            Clear
          </Button>

          <Button type="button" size="sm" onClick={handleDone} disabled={!year}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
