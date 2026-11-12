"use client";

import { useRef } from "react";
import { Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DocumentPicker({
  onUpload,
  disabled = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt",
}) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const attachments = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    onUpload?.(attachments);
    e.target.value = "";
  }

  return (
    <TooltipProvider>
      <input
        ref={inputRef}
        hidden
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9 shrink-0"
            onClick={() => inputRef.current?.click()}
            aria-label="Add document"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Add document</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
