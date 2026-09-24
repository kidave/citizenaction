"use client";

import { useState } from "react";

import { validateAttachments } from "@/utils/attachment/attachmentValidation";
import { compressImage } from "@/utils/attachment/compressImage";
import { createPreview } from "@/utils/attachment/createPreview";
import { extractAttachmentMetadata } from "@/utils/attachment/attachmentMetadata";

export function useAttachmentProcessor(options = {}) {
  const {
    compressImages = true,
    maxFiles = 10,
    maxFileSize = 10 * 1024 * 1024,
    allowedTypes = ["image/*", "application/pdf"],
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files) => {
    setIsProcessing(true);

    try {
      const fileList = Array.from(files);

      validateAttachments(fileList, {
        maxFiles,
        maxFileSize,
        allowedTypes,
      });

      const processed = [];

      for (const file of fileList) {
        let processedFile = file;

        // Compress images
        if (compressImages && processedFile.type.startsWith("image/")) {
          processedFile = await compressImage(processedFile);
        }

        const metadata = await extractAttachmentMetadata(processedFile);

        processed.push({
          // Unique id
          id: crypto.randomUUID(),

          // Original file (needed for uploads)
          file: processedFile,

          // Display information
          url: createPreview(processedFile),
          name: processedFile.name,

          // Keep the browser's native MIME type
          type: processedFile.type,

          size: processedFile.size,

          // Upload state
          source: "local",
          uploadStatus: "pending",
          error: null,

          // Extra metadata
          ...metadata,
        });
      }

      return processed;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processFiles,
    isProcessing,
  };
}
