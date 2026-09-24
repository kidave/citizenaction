"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { toast } from "sonner";
import { Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

import { useAttachmentProcessor } from "@/hooks/useAttachmentProcessor";

import { ALLOWED_TYPES, MAX_FILES, MAX_FILE_SIZE } from "@/utils/attachment";

export default function AttachmentDropzone({ onUpload }) {
  const { processFiles, isProcessing } = useAttachmentProcessor({
    compressImages: true,

    maxFiles: MAX_FILES,

    maxFileSize: MAX_FILE_SIZE,

    allowedTypes: ALLOWED_TYPES,
  });

  const onDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const processed = await processFiles(acceptedFiles);

        onUpload(processed);

        toast.success(`${processed.length} attachment(s) added`);
      } catch (error) {
        toast.error(error.message);
      }
    },
    [processFiles, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,

    multiple: true,

    disabled: isProcessing,

    accept: Object.fromEntries(ALLOWED_TYPES.map((type) => [type, []])),
  });

  return (
    <Attachment
      {...getRootProps()}
      orientation="horizontal"
      className={[
        "relative cursor-pointer gap-2 overflow-hidden rounded-2xl",
        "border border-dashed p-4 transition-colors",
        isDragActive ? "border-primary bg-primary/10" : "border-muted",
        isProcessing ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      <input {...getInputProps()} />

      <AttachmentMedia>
        <Paperclip className="h-5 w-5 text-primary" />
      </AttachmentMedia>

      <AttachmentContent>
        <AttachmentTitle>
          {isProcessing ? "Processing attachments..." : "Add attachments"}
        </AttachmentTitle>

        <AttachmentDescription>
          {isProcessing
            ? "Please wait..."
            : "Drop files here or browse to upload."}
        </AttachmentDescription>
      </AttachmentContent>

      <AttachmentActions>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isProcessing}
        >
          Browse
        </Button>
      </AttachmentActions>
    </Attachment>
  );
}
