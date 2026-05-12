"use client";

import {
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
}) {

  const [open, setOpen] =
    useState(false);

  const [draft, setDraft] =
    useState(value || "");

  function handleSave() {

    onChange(draft);

    setOpen(false);
  }

  // =====================================================
  // ENTER SAVE
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
          flex-1
          flex
          items-center
          gap-2
        "
      >

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
          placeholder="https://..."
          className="
            h-10
          "
        />

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
            variant={
              value
                ? "default"
                : "outline"
            }
            size="icon"
            className="
              h-10
              w-10
              rounded-xl
            "
            onClick={() =>
              setOpen(true)
            }
          >

            <Link2
              className="
                w-4
                h-4
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