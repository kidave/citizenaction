"use client";

import { ChevronDown, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import LinkManager from "@/components/feed/editor/LinkManager";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";

import EditorDateTime from "./EditorDateTime";
import EditorAddress from "./EditorAddress";

const TYPE_OPTIONS = [
  { value: "event", label: "Event" },
  { value: "meeting", label: "Meeting" },
  { value: "report", label: "Report" },
  { value: "update", label: "Update" },
];

function getTypeLabel(type) {
  return TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Post";
}

export default function EditorFooter({ mode, item, editor, onClose }) {
  const isPost = mode === "post";
  const typeLabel = getTypeLabel(editor.type);
  const showTypeSelector = isPost && !editor?.editorTypeLocked;

  return (
    <div className="border-t bg-background/95 px-2 py-2 backdrop-blur sm:p-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          {showTypeSelector && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 gap-1 rounded-md px-2 text-xs font-medium"
                >
                  {typeLabel}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" side="top">
                {TYPE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => editor.setType(option.value)}
                    className={editor.type === option.value ? "bg-muted" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ImagePicker
            onUpload={(files) =>
              editor.setAttachments((prev) => [...prev, ...files])
            }
          />

          <DocumentPicker
            onUpload={(files) =>
              editor.setAttachments((prev) => [...prev, ...files])
            }
          />

          {isPost && <EditorDateTime editor={editor} />}
          {isPost && <EditorAddress editor={editor} />}

          <LinkManager value={editor.links} onChange={editor.setLinks} />
        </div>

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
