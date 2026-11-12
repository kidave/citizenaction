"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { compressImage } from "@/utils/attachment/compressImage";

export default function ImagePicker({
  onUpload,
  disabled = false,
  accept = "image/*,video/*",
}) {
  const inputRef = useRef(null);

  async function handleChange(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const attachments = await Promise.all(
      files.map(async (file) => {
        let processedFile = file;

        if (file.type.startsWith("image/")) {
          processedFile = await compressImage(file);
        }

        return {
          id: crypto.randomUUID(),
          file: processedFile,
          url: URL.createObjectURL(processedFile),
          name: processedFile.name,
          type: processedFile.type,
          size: processedFile.size,
        };
      }),
    );

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
            aria-label="Add image or video"
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Add image or video</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
