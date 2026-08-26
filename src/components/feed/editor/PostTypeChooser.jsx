"use client";

import {
  Megaphone,
  CalendarDays,
  ListOrdered,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const OPTIONS = [
  {
    value: "action",
    label: "Write a post",
    description: "Share an update, observation or action.",
    icon: Zap,
  },
  {
    value: "event",
    label: "Add an event",
    description: "Add date, time and location.",
    icon: CalendarDays,
  },
  {
    value: "meeting",
    label: "Add minutes of meeting",
    description: "Create an ordered record of a meeting.",
    icon: ListOrdered,
  },
  {
    value: "update",
    label: "Add an announcement",
    description: "Publish a formal, detailed announcement.",
    icon: Megaphone,
  },
];

export default function PostTypeChooser({ value, onChange, compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant={selected ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onChange(option.value)}
              className="h-8 gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label.replace("Write a ", "").replace("Add ", "")}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="border-b bg-muted/20 px-4 py-4">
      <div className="mb-3">
        <div className="text-sm font-semibold">What are you adding?</div>
        <div className="text-xs text-muted-foreground">
          Choose what you want to create. You can start writing immediately.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/5"
                  : "bg-background hover:bg-muted/50"
              }`}
            >
              <span className="mt-0.5 rounded-lg border bg-background p-2">
                <Icon className="h-4 w-4" />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
