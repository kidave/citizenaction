"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        f.type?.startsWith("image/")
      ).length;

      let totalSize = attachments.reduce(
        (sum, f) => sum + (f.size || 0),
        0
      );

      const validFiles = [];

      for (const file of acceptedFiles) {
        // Image count validation
        if (file.type.startsWith("image/")) {
          const newImageCount =
            currentImageCount +
            validFiles.filter((f) =>
              f.type.startsWith("image/")
            ).length;

          if (newImageCount >= MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
            continue;
          }
        }

        // File size validation
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large (max 1MB)`);
          continue;
        }

        // Total size validation
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
    [attachments, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      multiple: true,
      accept: ALLOWED_TYPES.reduce((acc, type) => {
        acc[type] = [];
        return acc;
      }, {}),
    });

  const getFilePreview = (file) => {
    if (!file?.type?.startsWith("image/")) return null;

    if (!file.url) {
      return URL.createObjectURL(file);
    }

    return file.url;
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }
    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-muted"
        }`}
      >
        <input {...getInputProps()} />

        <Paperclip className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />

        <p className="text-sm font-medium">
          Drag & drop files here
        </p>

        <p className="text-xs text-muted-foreground mt-1">
          Images (max {MAX_IMAGES}), PDF, Docs (1MB each,
          5MB total)
        </p>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
        >
          Browse Files
        </Button>
      </div>

      {/* Attachment Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {attachments.map((file, index) => {
            const isImage =
              file.type?.startsWith("image/");
            const preview = getFilePreview(file);

            return (
              <Card
                key={index}
                className="relative group overflow-hidden"
              >
                <div className="aspect-square bg-muted">
                  {isImage && preview ? (
                    <div className="relative w-full h-full">
                      {preview.startsWith("blob:") ? (
                        <img
                          src={preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={preview}
                          alt={file.name}
                          fill
                          sizes="(max-width:768px) 50vw, 25vw"
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      {getFileIcon(file)}
                      <p className="text-xs text-center mt-2 truncate w-full">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}