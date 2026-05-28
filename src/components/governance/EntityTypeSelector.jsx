"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function EntityTypeSelector({ value, onChange }) {
  return (
    <div className="flex justify-end">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v)}
        variant="outline"
      >
        <ToggleGroupItem
          value="all"
          className="rounded-none border-r-0 first:rounded-l-md"
        >
          All
        </ToggleGroupItem>

        <ToggleGroupItem value="authority" className="rounded-none border-r-0">
          Authority
        </ToggleGroupItem>

        <ToggleGroupItem value="department" className="rounded-none border-r-0">
          Department
        </ToggleGroupItem>

        <ToggleGroupItem
          value="designation"
          className="rounded-none border-r-0"
        >
          Role
        </ToggleGroupItem>

        <ToggleGroupItem
          value="person"
          className="rounded-none last:rounded-r-md"
        >
          Person
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
