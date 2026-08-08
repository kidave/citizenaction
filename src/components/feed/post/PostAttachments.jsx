"use client";

import { useMemo, useState } from "react";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";

import PDFViewer from "@/components/attachment/PDFViewer";
import AttachmentCarousel from "@/components/attachment/AttachmentCarousel";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function PostAttachments({ attachments = [] }) {
  const [openImages, setOpenImages] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);

  const [selectedPdf, setSelectedPdf] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const images = useMemo(() => {
    return attachments.filter((attachment) =>
      attachment?.mime_type?.startsWith("image/"),
    );
  }, [attachments]);

  const imageSlides = useMemo(() => {
    return images.map((image) => ({
      src: image.public_url,
      alt: image.file_name || "",
      width: image.width || undefined,
      height: image.height || undefined,
    }));
  }, [images]);

  const handleClick = (attachment) => {
    if (!attachment) return;

    const mime = attachment.mime_type || "";
    const extension = attachment.file_name?.split(".").pop()?.toLowerCase();

    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf" || extension === "pdf";

    if (isImage) {
      const imageIndex = images.findIndex(
        (image) => image.public_url === attachment.public_url,
      );

      setStartIndex(imageIndex >= 0 ? imageIndex : 0);
      setOpenImages(true);

      return;
    }

    if (isPdf) {
      setSelectedPdf(attachment);
      setOpenPdf(true);
    }
  };

  return (
    <>
      {/* =====================================================
          ATTACHMENT PREVIEW
      ===================================================== */}

      <AttachmentCarousel
        attachments={attachments}
        showMetadata={false}
        onAttachmentClick={(index) => {
          handleClick(attachments[index]);
        }}
      />

      {/* =====================================================
          IMAGE LIGHTBOX
      ===================================================== */}

      <Lightbox
        open={openImages}
        close={() => setOpenImages(false)}
        index={startIndex}
        slides={imageSlides}
        plugins={[Zoom]}
        carousel={{
          finite: true,
        }}
        render={{
          buttonPrev: imageSlides.length > 1 ? undefined : () => null,
          buttonNext: imageSlides.length > 1 ? undefined : () => null,
        }}
      />

      {/* =====================================================
          PDF VIEWER
      ===================================================== */}

      <Dialog open={openPdf} onOpenChange={setOpenPdf}>
        <DialogContent className="h-[90vh] max-w-5xl overflow-hidden p-0">
          {selectedPdf?.public_url && (
            <PDFViewer fileUrl={selectedPdf.public_url} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
