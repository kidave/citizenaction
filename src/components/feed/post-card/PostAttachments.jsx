"use client";

import { useState } from "react";

import Attachments from "@/components/ui/Attachments";
import AttachmentViewer from "@/components/ui/AttachmentViewer";

export default function PostAttachments({ attachments = [] }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <Attachments
        attachments={attachments}
        onOpen={(index) => {
          setActiveIndex(index);
          setViewerOpen(true);
        }}
      />

      <AttachmentViewer
        attachments={attachments}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        activeIndex={activeIndex}
      />
    </>
  );
}