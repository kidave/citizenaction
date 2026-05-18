"use client";

import { useState } from "react";

import { FocusCards } from "@/components/ui/focus-cards";
import AttachmentViewer from "@/components/ui/AttachmentViewer";

export default function Attachments({
  attachments = [],
}) {
  const [viewerOpen, setViewerOpen] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(0);

  if (!attachments.length) return null;

  return (
    <>
      <FocusCards
        images={attachments}
        onCardClick={(index) => {
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