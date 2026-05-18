"use client";

import ImageViewer from "./ImageViewer";
import PDFViewer from "./PDFViewer";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function AttachmentViewer({
  attachments = [],
  open,
  onOpenChange,
  activeIndex = 0,
}) {
  const activeAttachment =
    attachments[activeIndex];

  if (!activeAttachment) {
    return null;
  }

  /* =========================================
     IMAGE VIEWER
  ========================================= */

  if (activeAttachment.isImage) {

    const imageAttachments =
      attachments.filter(
        (a) => a.isImage
      );

    const imageIndex =
      imageAttachments.findIndex(
        (a) =>
          a.url ===
          activeAttachment.url
      );

    return (
      <ImageViewer
        open={open}
        onClose={() =>
          onOpenChange(false)
        }
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
      <Dialog
        open={open}
        onOpenChange={
          onOpenChange
        }
      >

        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden">

          <PDFViewer
            fileUrl={
              activeAttachment.url
            }
          />

        </DialogContent>

      </Dialog>
    );
  }

  return null;
}