"use client";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

export default function FieldInfo({ text }) {
  if (!text) return null;

  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-4 w-4" />
        </button>
      </HoverCardTrigger>

      <HoverCardContent className="w-72 text-sm text-muted-foreground">
        {text}
      </HoverCardContent>
    </HoverCard>
  );
}