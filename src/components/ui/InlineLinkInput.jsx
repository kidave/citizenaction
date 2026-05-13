"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Link2,
  Check,
} from "lucide-react";

export default function InlineLinkInput({
  value,
  onChange,
  placeholder = "https://...",
}) {
  const [open, setOpen] =
    useState(false);

  const [draft, setDraft] =
    useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  // =====================================================
  // SAVE
  // =====================================================

  function handleSave() {

    onChange(
      draft.trim()
    );

    setOpen(false);
  }

  // =====================================================
  // ENTER
  // =====================================================

  function handleKeyDown(
    e
  ) {

    if (
      e.key === "Enter"
    ) {

      e.preventDefault();

      handleSave();
    }
  }

  // =====================================================
  // INPUT MODE
  // =====================================================

  if (open) {

    return (
      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        {/* ICON */}
        <Button
          variant="ghost"
          size="icon"
          className="
            shrink-0
          "
          onClick={() =>
            setOpen(false)
          }
        >

          <Link2
            className="
              w-5
              h-5
            "
          />

        </Button>

        {/* INPUT */}
        <Input
          autoFocus
          value={draft}
          onChange={(e) =>
            setDraft(
              e.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            placeholder
          }
          className="h-8"
        />

        {/* SAVE */}
        <Button
          size="icon"
          onClick={
            handleSave
          }
        >

          <Check
            className="
              w-4
              h-4
            "
          />

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

        <TooltipTrigger
          asChild
        >

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setOpen(true)
            }
          >

            <Link2
              className="
                w-5
                h-5
              "
            />

          </Button>

        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="
            max-w-xs
            break-all
          "
        >

          {value ||
            "Add link"}

        </TooltipContent>

      </Tooltip>

    </TooltipProvider>
  );
}