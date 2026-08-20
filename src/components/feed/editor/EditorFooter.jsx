"use client";

import {
  Save,
  ChevronDown,
  Orbit,
  FileWarning,
  Bell,
  CalendarDays,
  Presentation,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import LinkManager from "@/components/feed/editor/LinkManager";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";

import EditorDateTime from "./EditorDateTime";
import EditorAddress from "./EditorAddress";

import { EDITOR_TYPE_CONFIG } from "./editorTypes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPES = [
  {
    value: "action",
    icon: Orbit,
  },
  {
    value: "report",
    icon: FileWarning,
  },
  {
    value: "update",
    icon: Bell,
  },
  {
    value: "event",
    icon: CalendarDays,
  },
  {
    value: "meeting",
    icon: Presentation,
  },
];

export default function EditorFooter({ mode, item, editor, onClose }) {
  const currentType =
    TYPES.find((type) => type.value === editor.type) || TYPES[0];

  const CurrentIcon = currentType.icon;
  const currentConfig = EDITOR_TYPE_CONFIG[currentType.value];

  const handleTypeChange = (type) => {
    editor.setType(type);
  };

  return (
    <div className="border-t bg-background/95 px-2 py-2 backdrop-blur sm:p-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        {/* =====================================================
            LEFT TOOLBAR
        ===================================================== */}

        <div className="flex min-w-0 items-center gap-1">
          {/* ---------------------------------------------------
              POST TYPE
          --------------------------------------------------- */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label={`Post type: ${currentConfig?.label || "Action"}`}
              >
                <CurrentIcon className="h-5 w-5" />
                <ChevronDown className="ml-[-4px] h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" side="top" className="w-64">
              <DropdownMenuLabel>Post type</DropdownMenuLabel>

              <DropdownMenuSeparator />

              {TYPES.map((type) => {
                const Icon = type.icon;
                const config = EDITOR_TYPE_CONFIG[type.value];

                const selected = editor.type === type.value;

                return (
                  <DropdownMenuItem
                    key={type.value}
                    onSelect={() => handleTypeChange(type.value)}
                    className="gap-3 py-2.5"
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.label}</span>

                        {selected && (
                          <span className="text-xs text-muted-foreground">
                            Selected
                          </span>
                        )}
                      </div>

                      {config.placeholder && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {config.placeholder}
                        </p>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ---------------------------------------------------
              IMAGE
          --------------------------------------------------- */}

          <ImagePicker
            onUpload={(files) =>
              editor.setAttachments((prev) => [...prev, ...files])
            }
          />

          {/* ---------------------------------------------------
              DOCUMENT
          --------------------------------------------------- */}

          <DocumentPicker
            onUpload={(files) =>
              editor.setAttachments((prev) => [...prev, ...files])
            }
          />

          {/* ---------------------------------------------------
              DATE / TIME
          --------------------------------------------------- */}

          <EditorDateTime editor={editor} />

          {/* ---------------------------------------------------
              ADDRESS
          --------------------------------------------------- */}

          <EditorAddress editor={editor} />

          {/* ---------------------------------------------------
              LINKS
          --------------------------------------------------- */}

          <LinkManager value={editor.links} onChange={editor.setLinks} />
        </div>

        {/* =====================================================
            SUBMIT
        ===================================================== */}

        <Button
          type="button"
          onClick={() => editor.submit(onClose)}
          className="shrink-0"
        >
          <Save className="mr-2 h-4 w-4" />

          {mode === "post"
            ? item
              ? "Update"
              : "Post"
            : item
              ? "Update"
              : "Add"}
        </Button>
      </div>
    </div>
  );
}
