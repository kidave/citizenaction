"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  File,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileType,
  Image as ImageIcon,
  Paperclip,
  Presentation,
} from "lucide-react";

import { getPdfThumbnail } from "@/utils/media/getPdfThumbnail";

export default function AttachmentPreview({ attachment }) {
  const [pdfThumbnail, setPdfThumbnail] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadThumbnail() {
      if (attachment?.type === "application/pdf" && attachment?.url) {
        const thumbnail = await getPdfThumbnail(attachment.url);

        if (mounted) {
          setPdfThumbnail(thumbnail);
        }
      }
    }

    loadThumbnail();

    return () => {
      mounted = false;
    };
  }, [attachment?.type, attachment?.url]);

  if (!attachment) return null;

  const mime = attachment.type || "";

  /* ==========================================
     IMAGE
  ========================================== */

  if (mime.startsWith("image/")) {
    return (
      <Image
        src={attachment.url}
        alt={attachment.name || ""}
        fill
        placeholder="empty"
        loading="lazy"
        sizes="320px"
        className="object-cover"
      />
    );
  }

  /* ==========================================
     PDF
  ========================================== */

  if (mime === "application/pdf") {
    if (pdfThumbnail) {
      return (
        <>
          <Image
            src={pdfThumbnail}
            alt=""
            fill
            placeholder="empty"
            loading="lazy"
            unoptimized
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          <div className="absolute bottom-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold shadow-md backdrop-blur">
            PDF
          </div>
        </>
      );
    }

    return (
      <PreviewFallback
        icon={<FileText className="h-14 w-14" />}
        label="PDF"
        color="text-red-500"
      />
    );
  }

  /* ==========================================
     WORD
  ========================================== */

  if (
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return (
      <PreviewFallback
        icon={<FileType className="h-10 w-10" />}
        label="DOCX"
        color="text-blue-600"
      />
    );
  }

  /* ==========================================
     EXCEL
  ========================================== */

  if (mime.includes("spreadsheet") || mime.includes("excel")) {
    return (
      <PreviewFallback
        icon={<FileSpreadsheet className="h-10 w-10" />}
        label="XLSX"
        color="text-green-600"
      />
    );
  }

  /* ==========================================
     POWERPOINT
  ========================================== */

  if (mime.includes("presentation") || mime.includes("powerpoint")) {
    return (
      <PreviewFallback
        icon={<Presentation className="h-10 w-10" />}
        label="PPT"
        color="text-orange-500"
      />
    );
  }

  /* ==========================================
     TEXT
  ========================================== */

  if (mime.startsWith("text/")) {
    return (
      <PreviewFallback icon={<FileCode className="h-10 w-10" />} label="TXT" />
    );
  }

  /* ==========================================
     ZIP
  ========================================== */

  if (
    mime.includes("zip") ||
    mime.includes("compressed") ||
    mime.includes("rar")
  ) {
    return (
      <PreviewFallback
        icon={<FileArchive className="h-10 w-10" />}
        label="ZIP"
      />
    );
  }

  /* ==========================================
     GENERIC FILE
  ========================================== */

  return (
    <PreviewFallback icon={<Paperclip className="h-10 w-10" />} label="FILE" />
  );
}

function PreviewFallback({ icon, label, color = "text-muted-foreground" }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50">
      <div className={color}>{icon}</div>

      <span className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
