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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

          {others.map((item, i) => {

            /* 📄 PDF */
            if (item.type === "pdf") {
              return (
                <div
                  key={i}
                  onClick={() => setActivePdf(item.url)}
                  className="relative h-32 rounded-lg border bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/70 transition"
                >
                  <span className="text-sm">📄 PDF</span>

                  <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs p-1 text-center">
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
                  className="relative h-32 rounded-lg border bg-black flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-xl">▶</span>
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
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setActivePdf(null)}
        >
          <div
            className="w-[90vw] h-[80vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <PDFViewer fileUrl={activePdf} />
          </div>
        </div>
      )}

      {/* 🎥 VIDEO VIEWER */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-[90vw] max-w-3xl aspect-video bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={activeVideo.embed || activeVideo.url}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
}