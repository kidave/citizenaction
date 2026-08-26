"use client";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

import LinkManager from "@/components/feed/editor/LinkManager";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";

import EditorDateTime from "./EditorDateTime";
import EditorAddress from "./EditorAddress";

export default function EditorFooter({ mode, item, editor, onClose }) {
  const showDateTime = mode === "post" && editor.type === "event";
  const showAddress = mode === "post" && editor.type === "event";

  return (
    <div className="border-t bg-background/95 px-2 py-2 backdrop-blur sm:p-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
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

          {showDateTime && <EditorDateTime editor={editor} />}
          {showAddress && <EditorAddress editor={editor} />}

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
