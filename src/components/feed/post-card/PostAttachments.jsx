"use client";

import { useMemo, useState } from "react";

import { FocusCards } from "@/components/ui/focus-cards";

import AttachmentViewer from "@/components/ui/AttachmentViewer";

export default function PostAttachments({
  attachments = [],
}) {
  const [viewerOpen, setViewerOpen] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const normalizedAttachments =
    useMemo(() => {
      return attachments.map(
        (attachment) => ({
          ...attachment,

          isImage:
            attachment.type?.startsWith(
              "image/"
            ),

          isPdf:
            attachment.type ===
            "application/pdf",
        })
      );
    }, [attachments]);

  if (!normalizedAttachments.length) {
    return null;
  }

  return (
    <>
      <FocusCards
        images={normalizedAttachments}
        onCardClick={(index) => {
          setActiveIndex(index);
          setViewerOpen(true);
        }}
      />

      <AttachmentViewer
        attachments={
          normalizedAttachments
        }
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        activeIndex={activeIndex}
      />
    </>
  );
}