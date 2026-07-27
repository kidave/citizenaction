"use client";

import { useRef } from "react";

import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { compressImage } from "@/utils/attachment/compressImage";

export default function ImagePicker({ onUpload, disabled = false }) {
  const inputRef = useRef(null);

  async function handleChange(e) {
    const files = Array.from(e.target.files || []);

    console.log(
      files.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
    );

    if (!files.length) return;

    const attachments = await Promise.all(
      files.map(async (file) => {
        let processedFile = file;

        // Compress only images
        if (file.type.startsWith("image/")) {
          processedFile = await compressImage(file);
        }

        return {
          id: crypto.randomUUID(),

          // Upload this to storage
          file: processedFile,

          // Preview
          url: URL.createObjectURL(processedFile),

          // Metadata
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
    <>
      <input
        ref={inputRef}
        hidden
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleChange}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="h-5 w-5" />
      </Button>
    </>
  );
}
