"use client";

import { useTheme } from "next-themes";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <article className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Appearance</h2>

        <p className="mt-2 text-muted-foreground">
          Choose a theme for the application. You can select Light, Dark, System
          (follows your device settings) or Space (inherits the theme of the
          current space).
        </p>
      </header>

      <RadioGroup value={theme} onValueChange={setTheme} className="space-y-4">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="light" id="light" />
          <Label htmlFor="light">Light</Label>
        </div>

        <div className="flex items-center gap-3">
          <RadioGroupItem value="dark" id="dark" />
          <Label htmlFor="dark">Dark</Label>
        </div>

        <div className="flex items-center gap-3">
          <RadioGroupItem value="system" id="system" />
          <Label htmlFor="system">System</Label>
        </div>

        <div className="flex items-center gap-3">
          <RadioGroupItem value="space" id="space" />
          <Label htmlFor="space">Space</Label>
        </div>
      </RadioGroup>
    </article>
  );
}
