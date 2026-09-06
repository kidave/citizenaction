"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const TYPES = [
  ["all", "All"],
  ["authority", "Authority"],
  ["ministry", "Ministry"],
  ["department", "Department"],
  ["organisation", "Organisation"],
  ["committee", "Committee"],
  ["office", "Office"],
  ["division", "Division"],
  ["unit", "Unit"],
  ["ward", "Ward"],
  ["station", "Station"],
  ["person", "Person"],
  ["position", "Position"],
  ["programme", "Programme"],
  ["project", "Project"],
];

export default function EntityTypeSelector({ value, onChange }) {
  return (
    <div className="overflow-x-auto">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => next && onChange(next)}
        variant="outline"
        className="w-max"
      >
        {TYPES.map(([type, label], index) => (
          <ToggleGroupItem
            key={type}
            value={type}
            className={`rounded-none ${index < TYPES.length - 1 ? "border-r-0" : ""} ${index === 0 ? "rounded-l-md" : ""} ${index === TYPES.length - 1 ? "rounded-r-md" : ""}`}
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
