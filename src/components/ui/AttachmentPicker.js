"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X, FileText, File, Paperclip, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB per file
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB total
const MAX_IMAGES = 4;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export default function AttachmentPicker({
  attachments = [],
  onUpload,
  onRemove,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const currentImageCount = attachments.filter((f) =>
        f.type?.startsWith("image/"),
      ).length;

      let totalSize = attachments.reduce((sum, f) => sum + (f.size || 0), 0);

      const validFiles = [];

      for (const file of acceptedFiles) {
        // Image limit
        if (file.type.startsWith("image/")) {
          const newImageCount =
            currentImageCount +
            validFiles.filter((f) => f.type.startsWith("image/")).length;

          if (newImageCount >= MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
            continue;
          }
        }

        // Individual size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 1MB limit`);
          continue;
        }

        // Total size
        if (totalSize + file.size > MAX_TOTAL_SIZE) {
          toast.error(`Total attachments exceed 5MB`);
          continue;
        }

        // Type validation
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name} type not supported`);
          continue;
        }

        validFiles.push(file);
        totalSize += file.size;
      }

      if (!validFiles.length) return;

      validFiles.forEach((file) => onUpload(file));
      toast.success(`${validFiles.length} file(s) added`);
    },
    [attachments, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: ALLOWED_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
  });

  const getFilePreview = (file) => {
    if (!file?.type?.startsWith("image/")) return null;
    return file.url || URL.createObjectURL(file);
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }
    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Compact Upload Bar */}
      <div
        {...getRootProps()}
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 transition ${isDragActive ? "border-primary bg-primary/10" : "border-muted"} `}
      >
        <input {...getInputProps()} />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="h-4 w-4" />
          <span>Add attachments</span>
        </div>

        <Button type="button" size="sm" variant="outline">
          Browse
        </Button>
      </div>

      {/* Compact Preview Grid */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => {
            const isImage = file.type?.startsWith("image/");
            const preview = getFilePreview(file);

            return (
              <div key={index} className="group relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {isImage && preview ? (
                    preview.startsWith("blob:") ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={preview}
                        alt={file.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center p-1 text-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => onRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
