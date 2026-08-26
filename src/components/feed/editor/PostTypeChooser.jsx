"use client";

import { Megaphone, CalendarDays, ListOrdered, FileText } from "lucide-react";

const OPTIONS = [
  {
    value: "event",
    label: "Add an event",
    description: "Something happening at a time and place.",
    icon: CalendarDays,
  },
  {
    value: "meeting",
    label: "Add a meeting",
    description: "A formal meeting with officials or a group.",
    icon: ListOrdered,
  },
  {
    value: "report",
    label: "Write a report",
    description: "Create a detailed document, project report or proposal.",
    icon: FileText,
  },
  {
    value: "update",
    label: "Post an update",
    description: "Share an announcement, development or important update.",
    icon: Megaphone,
  },
];

export default function PostTypeChooser({ value, onChange }) {
  return (
    <div className="border-b bg-muted/20 px-4 py-4">
      <div className="mb-3">
        <div className="text-sm font-semibold">What would you like to add?</div>
        <div className="text-xs text-muted-foreground">
          Or just start writing below for a regular post.
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
