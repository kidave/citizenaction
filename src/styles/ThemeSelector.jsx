"use client";

import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  {
    value: "system",
    title: "System",
    description: "Follow your device appearance.",
  },
  {
    value: "light",
    title: "Light",
    description: "Bright interface.",
  },
  {
    value: "dark",
    title: "Dark",
    description: "Dark interface.",
  },
  {
    value: "space",
    title: "Space",
    description: "Space-themed interface.",
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      {themes.map((option) => {
        const selected = theme === option.value;

        return (
          <Button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all",
              selected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
            )}
          >
            <div>
              <p className="font-medium">{option.title}</p>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>

            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border",
                selected && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {selected && <Check className="h-3 w-3" />}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
