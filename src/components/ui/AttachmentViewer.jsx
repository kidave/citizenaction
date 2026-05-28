"use client";

import ImageViewer from "./ImageViewer";
import PDFViewer from "./PDFViewer";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AttachmentViewer({
  attachments = [],
  open,
  onOpenChange,
  activeIndex = 0,
}) {
  const activeAttachment = attachments[activeIndex];

  if (!activeAttachment) {
    return null;
  }

  /* =========================================
     IMAGE VIEWER
  ========================================= */

  if (activeAttachment.isImage) {
    const imageAttachments = attachments.filter((a) => a.isImage);

    const imageIndex = imageAttachments.findIndex(
      (a) => a.url === activeAttachment.url,
    );

    return (
      <ImageViewer
        open={open}
        onClose={() => onOpenChange(false)}
        images={imageAttachments}
        startIndex={imageIndex}
      />
    );
  }

  /* =========================================
     PDF VIEWER
  ========================================= */

  if (activeAttachment.isPdf) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-[90vh] max-w-5xl overflow-hidden p-0">
          <PDFViewer fileUrl={activeAttachment.url} />
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
