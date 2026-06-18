"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function InlineLinkInput({
  value,
  onChange,
  placeholder = "https://...",
}) {
  const [open, setOpen] = useState(false);

  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  // =====================================================
  // SAVE
  // =====================================================

  function handleSave() {
    onChange(draft.trim());

    setOpen(false);
  }

  // =====================================================
  // ENTER
  // =====================================================

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();

      handleSave();
    }
  }

  // =====================================================
  // INPUT MODE
  // =====================================================

  if (open) {
    return (
      <div className="flex w-[500px] max-w-full items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setOpen(false)}
        >
          <Link2 className="h-5 w-5" />
        </Button>

        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 flex-1"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setDraft("");
            onChange("");
            setOpen(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>

        <Button size="icon" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // =====================================================
  // ICON MODE
  // =====================================================

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Link2 className="h-5 w-5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="top" className="max-w-xs break-all">
          {value || "Add link"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
