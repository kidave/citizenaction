"use client";

import { useState } from "react";

/* ✅ YOUR EXISTING COMPONENTS */
import ImageGrid from "@/components/ui/ImageGrid";
import ImageViewer from "@/components/ui/ImageViewer";
import PDFViewer from "@/components/ui/PDFViewer";

export default function UnifiedMediaGrid({ media = [] }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  if (!media.length) return null;

  /* -------------------------
     SPLIT MEDIA
  ------------------------- */
  const images = media.filter((m) => m.type === "image");
  const others = media.filter((m) => m.type !== "image");

  const imageUrls = images.map((img) => img.url);

  return (
    <div className="mt-3 space-y-3">
      {/* 🖼️ IMAGE GRID */}
      {images.length > 0 && (
        <ImageGrid
          images={imageUrls}
          onImageClick={(index) => setActiveImageIndex(index)}
        />
      )}

      {/* 📦 OTHER MEDIA GRID */}
      {others.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {others.map((item, i) => {
            /* 📄 PDF */
            if (item.type === "pdf") {
              return (
                <div
                  key={i}
                  onClick={() => setActivePdf(item.url)}
                  className="relative flex h-32 cursor-pointer items-center justify-center rounded-lg border bg-muted transition hover:bg-muted/70"
                >
                  <span className="text-sm">📄 PDF</span>

                  <div className="absolute bottom-0 w-full bg-black/60 p-1 text-center text-xs text-white">
                    Open PDF
                  </div>
                </div>
              );
            }

            /* 🎥 VIDEO */
            if (item.type === "video") {
              return (
                <div
                  key={i}
                  onClick={() => setActiveVideo(item)}
                  className="relative flex h-32 cursor-pointer items-center justify-center rounded-lg border bg-black"
                >
                  <span className="text-xl text-white">▶</span>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* 🖼️ IMAGE VIEWER */}
      {activeImageIndex !== null && (
        <ImageViewer
          images={imageUrls}
          index={activeImageIndex}
          onClose={() => setActiveImageIndex(null)}
        />
      )}

      {/* 📄 PDF VIEWER */}
      {activePdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setActivePdf(null)}
        >
          <div
            className="h-[80vh] w-[90vw] overflow-hidden rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <PDFViewer fileUrl={activePdf} />
          </div>
        </div>
      )}

      {/* 🎥 VIDEO VIEWER */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="aspect-video w-[90vw] max-w-3xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={activeVideo.embed || activeVideo.url}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
