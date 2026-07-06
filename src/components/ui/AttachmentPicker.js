"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

import { Paperclip, Image as ImageIcon, FileText, File, X } from "lucide-react";

const MAX_FILE_SIZE = 1024 * 1024;
const MAX_TOTAL_SIZE = 5 * 1024 * 1024;
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
      const currentImages = attachments.filter((a) =>
        a.type?.startsWith("image/"),
      ).length;

      let totalSize = attachments.reduce(
        (sum, file) => sum + (file.size || 0),
        0,
      );

      const validFiles = [];

      for (const file of acceptedFiles) {
        if (file.type.startsWith("image/")) {
          const imageCount =
            currentImages +
            validFiles.filter((f) => f.type.startsWith("image/")).length;

          if (imageCount >= MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
            continue;
          }
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 1MB limit`);
          continue;
        }

        if (totalSize + file.size > MAX_TOTAL_SIZE) {
          toast.error("Total attachment size exceeds 5MB");
          continue;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not supported`);
          continue;
        }

        totalSize += file.size;
        validFiles.push(file);
      }

      validFiles.forEach(onUpload);

      if (validFiles.length) {
        toast.success(`${validFiles.length} attachment(s) added`);
      }
    },
    [attachments, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: ALLOWED_TYPES.reduce((obj, type) => {
      obj[type] = [];
      return obj;
    }, {}),
  });

  const imageAttachments = attachments.filter((file) =>
    file.type?.startsWith("image/"),
  );

  const documentAttachments = attachments.filter(
    (file) => !file.type?.startsWith("image/"),
  );

  const getPreview = (file) => {
    return file.url || URL.createObjectURL(file);
  };

  const getIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }

    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-600" />;
    }

    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";

    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <Attachment
        {...getRootProps()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border border-dashed bg-card p-4 transition ${isDragActive ? "border-primary bg-primary/10" : "border-muted"}`}
        orientation="horizontal"
      >
        <input {...getInputProps()} />

        <AttachmentMedia>
          <Paperclip className="h-5 w-5 text-primary" />
        </AttachmentMedia>

        <AttachmentContent>
          <AttachmentTitle>Add attachments</AttachmentTitle>
          <AttachmentDescription>
            Drop files here or browse to upload. Supported: JPG, PNG, GIF, WEBP,
            AVIF, PDF, DOC, DOCX, TXT.
          </AttachmentDescription>
        </AttachmentContent>

        <AttachmentActions>
          <Button type="button" size="sm" variant="outline">
            Browse
          </Button>
        </AttachmentActions>
      </Attachment>

      {/* ================= Images ================= */}

      {imageAttachments.length > 0 && (
        <AttachmentGroup>
          {imageAttachments.map((file, index) => {
            const preview = getPreview(file);

            return (
              <Attachment key={index} orientation="vertical">
                <AttachmentMedia variant="image">
                  {preview.startsWith("blob:") ? (
                    <img src={preview} alt={file.name} />
                  ) : (
                    <Image
                      src={preview}
                      alt={file.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </AttachmentMedia>

                <AttachmentContent>
                  <AttachmentTitle className="truncate">
                    {file.name}
                  </AttachmentTitle>

                  <AttachmentDescription>
                    Image • {formatSize(file.size)}
                  </AttachmentDescription>
                </AttachmentContent>

                <AttachmentActions>
                  <AttachmentAction
                    aria-label="Remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(attachments.indexOf(file));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            );
          })}
        </AttachmentGroup>
      )}

      {/* ================= Documents ================= */}

      {documentAttachments.length > 0 && (
        <div className="space-y-2">
          {documentAttachments.map((file) => (
            <Attachment key={file.name} className="w-full">
              <AttachmentMedia>{getIcon(file)}</AttachmentMedia>

              <AttachmentContent>
                <AttachmentTitle className="truncate">
                  {file.name}
                </AttachmentTitle>

                <AttachmentDescription>
                  {file.type === "application/pdf" ? "PDF" : "Document"}

                  {" • "}

                  {formatSize(file.size)}
                </AttachmentDescription>
              </AttachmentContent>

              <AttachmentActions>
                <AttachmentAction
                  aria-label="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(attachments.indexOf(file));
                  }}
                >
                  <X className="h-4 w-4" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </div>
      )}
    </div>
  );
}
