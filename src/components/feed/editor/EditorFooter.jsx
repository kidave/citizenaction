"use client";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

import LinkManager from "@/components/ui/LinkManager";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";

import EditorDateTime from "./EditorDateTime";
import EditorAddress from "./EditorAddress";

export default function EditorFooter({ mode, item, editor, onClose }) {
  return (
    <div className="border-t bg-background/95 p-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        {/* Left Toolbar */}
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

          <EditorDateTime editor={editor} />

          <EditorAddress editor={editor} />

          <LinkManager value={editor.links} onChange={editor.setLinks} />
        </div>

        {/* Submit */}
        <Button onClick={() => editor.submit(onClose)} className="shrink-0">
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
