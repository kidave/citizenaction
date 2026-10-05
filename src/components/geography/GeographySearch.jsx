"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GeographySearch({
  value,
  onChange,
  placeholder = "Search geography...",
  className,
}) {
  return (
    <div className={`relative ${className || ""}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Search geography"
      />
    </div>
  );
}
