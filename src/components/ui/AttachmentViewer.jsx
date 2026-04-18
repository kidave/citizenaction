"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImageViewer from "./ImageViewer";
import PDFViewer from "./PDFViewer";

export default function AttachmentViewer({
  attachments = [],
  open,
  onOpenChange,
  activeIndex = 0,
}) {
  if (!attachments.length || !open) return null;

  const activeFile = attachments[activeIndex];

  const isImage = activeFile?.type?.startsWith("image/");
  const isPDF = activeFile?.type === "application/pdf";
  const isVideo = activeFile.type === "video/link";

  /* ================= IMAGE HANDLING ================= */

  const imageAttachments = attachments.filter((a) =>
    a.type?.startsWith("image/")
  );

  // Map attachment index → image index
  const imageIndex = imageAttachments.findIndex(
    (img) => img.url === activeFile?.url
  );

  return (
    <>
      {isImage && (
        <ImageViewer
          open={open}
          onClose={() => onOpenChange(false)}
          images={imageAttachments}
          startIndex={imageIndex >= 0 ? imageIndex : 0}
        />
      )}

      {isPDF && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-6xl p-0">
            <PDFViewer fileUrl={activeFile.url} />
          </DialogContent>
        </Dialog>
      )}

      {isVideo && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl p-0 bg-black">
            <iframe
              src={activeFile.embed || activeFile.url}
              className="w-full aspect-video"
              allowFullScreen
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}