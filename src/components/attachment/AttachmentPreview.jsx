"use client";

import Image from "next/image";

import {
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileType,
  Paperclip,
  Presentation,
} from "lucide-react";

function getAttachmentUrl(attachment) {
  return (
    attachment?.public_url ||
    attachment?.publicUrl ||
    attachment?.url ||
    attachment?.preview_url ||
    null
  );
}

function getAttachmentMimeType(attachment) {
  return attachment?.mime_type || attachment?.mimeType || attachment?.type || "";
}

export default function AttachmentPreview({ attachment }) {
  if (!attachment) return null;

  const publicUrl = getAttachmentUrl(attachment);
  const mime = getAttachmentMimeType(attachment);
  const thumbnailUrl = attachment?.thumbnail_url || attachment?.thumbnailUrl || null;

  if (mime.startsWith("image/") && publicUrl) {
    return (
      <>
        <Image
          src={attachment.preview_url || publicUrl}
          alt={attachment.file_name || attachment.fileName || ""}
          fill
          placeholder="empty"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 768px"
          quality={75}
          className="object-cover"
        />
        <AttachmentBadge credit={attachment.credit_name} />
      </>
    );
  }

  if (mime === "application/pdf") {
    if (thumbnailUrl) {
      return (
        <>
          <Image
            src={thumbnailUrl}
            alt={attachment.file_name || "PDF preview"}
            fill
            placeholder="empty"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 768px"
            quality={70}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <AttachmentBadge type="PDF" credit={attachment.credit_name} />
        </>
      );
    }

    return (
      <PreviewFallback
        attachment={attachment}
        icon={<FileText className="h-14 w-14" />}
        label="PDF"
        color="text-red-500"
      />
    );
  }

  if (
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return (
      <PreviewFallback
        attachment={attachment}
        icon={<FileType className="h-10 w-10" />}
        label="DOCX"
        color="text-blue-600"
      />
    );
  }

  if (mime.includes("spreadsheet") || mime.includes("excel")) {
    return (
      <PreviewFallback
        attachment={attachment}
        icon={<FileSpreadsheet className="h-10 w-10" />}
        label="XLSX"
        color="text-green-600"
      />
    );
  }

  if (mime.includes("presentation") || mime.includes("powerpoint")) {
    return (
      <PreviewFallback
        attachment={attachment}
        icon={<Presentation className="h-10 w-10" />}
        label="PPT"
        color="text-orange-500"
      />
    );
  }

  if (mime.startsWith("text/")) {
    return (
      <PreviewFallback
        attachment={attachment}
        icon={<FileCode className="h-10 w-10" />}
        label="TXT"
      />
    );
  }

  if (mime.includes("zip") || mime.includes("compressed") || mime.includes("rar")) {
    return (
      <PreviewFallback
        attachment={attachment}
        icon={<FileArchive className="h-10 w-10" />}
        label="ZIP"
      />
    );
  }

  return (
    <PreviewFallback
      attachment={attachment}
      icon={<Paperclip className="h-10 w-10" />}
      label="FILE"
    />
  );
}

function PreviewFallback({ attachment, icon, label, color = "text-muted-foreground" }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50">
      <div className={color}>{icon}</div>
      <span className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground">
        {label}
      </span>
      <AttachmentBadge type={label} credit={attachment?.credit_name} />
    </div>
  );
}

function AttachmentBadge({ type, credit }) {
  if (!type && !credit) return null;

  return (
    <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
      {type && (
        <div className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur">
          {type}
        </div>
      )}
      {credit && (
        <div className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold shadow-md backdrop-blur">
          {credit}
        </div>
      )}
    </div>
  );
}
