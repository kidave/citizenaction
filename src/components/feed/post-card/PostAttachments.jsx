"use client";

import { useMemo, useState } from "react";

import EmblaCarousel from "@/components/ui/EmblaCarousel";

import PDFViewer from "@/components/ui/PDFViewer";

import { FocusCards } from "@/components/ui/focus-cards";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function PostAttachments({ attachments = [] }) {
  /* ========================================
     STATE
  ======================================== */

  const [openImages, setOpenImages] = useState(false);

  const [openPdf, setOpenPdf] = useState(false);

  const [selectedPdf, setSelectedPdf] = useState(null);

  const [startIndex, setStartIndex] = useState(0);

  /* ========================================
     FILTER IMAGES
  ======================================== */

  const images = useMemo(() => {
    return attachments.filter((a) => a?.type?.startsWith("image/"));
  }, [attachments]);

  /* ========================================
     CLICK HANDLER
  ======================================== */

  const handleClick = (attachment) => {
    if (!attachment) {
      return;
    }

    /* ====================================
       IMAGE
    ==================================== */

    if (attachment?.type?.startsWith("image/")) {
      const imageIndex = images.findIndex((img) => img.url === attachment.url);

      setStartIndex(imageIndex >= 0 ? imageIndex : 0);

      setOpenImages(true);

      return;
    }

    /* ====================================
       PDF
    ==================================== */

    if (attachment?.type === "application/pdf") {
      setSelectedPdf(attachment);

      setOpenPdf(true);
    }
  };

  return (
    <>
      {/* ====================================
          FOCUS CARDS
      ==================================== */}

      <FocusCards
        images={attachments}
        onCardClick={(index) => {
          const attachment = attachments[index];

          handleClick(attachment);
        }}
      />

      {/* ====================================
          IMAGE CAROUSEL
      ==================================== */}

      <Dialog open={openImages} onOpenChange={setOpenImages}>
        <DialogContent className="max-w-6xl overflow-hidden border-0 bg-black p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:bg-black/60 [&>button]:p-1 [&>button]:text-white [&>button]:opacity-100 [&>button]:backdrop-blur-sm [&>button]:hover:bg-black/80">
          <EmblaCarousel images={images} startIndex={startIndex} />
        </DialogContent>
      </Dialog>

      {/* ====================================
          PDF VIEWER
      ==================================== */}

      <Dialog open={openPdf} onOpenChange={setOpenPdf}>
        <DialogContent className="h-[90vh] max-w-5xl overflow-hidden p-0">
          {selectedPdf?.url && <PDFViewer fileUrl={selectedPdf.url} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
