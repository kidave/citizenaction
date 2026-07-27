"use client";

import { useRef } from "react";

import { Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DocumentPicker({ onUpload, disabled = false }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const attachments = files.map((file) => ({
      id: crypto.randomUUID(),

      // Upload this to storage
      file,

      // Preview
      url: URL.createObjectURL(file),

      // Metadata
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    onUpload?.(attachments);

    e.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        hidden
        type="file"
        multiple
        accept="
          .pdf,
          .doc,
          .docx,
          .xls,
          .xlsx,
          .ppt,
          .pptx,
          .txt,
          .zip,
          .rar
        "
        onChange={handleChange}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="h-5 w-5" />
      </Button>
    </>
  );
}
