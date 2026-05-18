"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  FileText,
  Paperclip,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { getPdfThumbnail } from "@/utils/media/getPdfThumbnail";

export function FocusCards({
  images = [],
  onCardClick,
}) {

  const [hovered, setHovered] =
    useState(null);

  if (!images?.length) return null;

  const visibleImages =
    images.slice(0, 4);

  return (
    <>
      {/* =========================================
          MOBILE
      ========================================= */}

      <div className="md:hidden">

        <div
          className={cn(
            "grid gap-1 rounded-xl overflow-hidden",
            images.length === 1
              ? "grid-cols-1"
              : "grid-cols-2"
          )}
        >

          {visibleImages.map(
            (img, index) => {

              const isThreeLayout =
                images.length === 3 &&
                index === 2;

              return (
                <div
                  key={
                    img.url || index
                  }
                  onClick={() =>
                    onCardClick?.(
                      index
                    )
                  }
                  className={cn(
                    "relative w-full cursor-pointer bg-muted overflow-hidden",
                    images.length === 1
                      ? "aspect-[3/2]"
                      : isThreeLayout
                      ? "col-span-2 aspect-[3/2]"
                      : "aspect-square"
                  )}
                >

                  <AttachmentPreview
                    attachment={img}
                  />

                  {images.length >
                    4 &&
                    index === 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                        +
                        {images.length -
                          4}
                      </div>
                    )}

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* =========================================
          DESKTOP
      ========================================= */}

      <div className="hidden md:grid grid-cols-3 gap-2 w-full">

        {images
          .slice(0, 3)
          .map((img, index) => {

            const remainingDesktop =
              images.length - 3;

            const isLastVisible =
              index === 2 &&
              remainingDesktop > 0;

            return (
              <div
                key={
                  img.url || index
                }
                onMouseEnter={() =>
                  setHovered(index)
                }
                onMouseLeave={() =>
                  setHovered(null)
                }
                onClick={() =>
                  onCardClick?.(
                    index
                  )
                }
                className={cn(
                  "rounded-lg relative overflow-hidden h-60 w-full transition-all duration-300 ease-out cursor-pointer bg-muted",
                  hovered !==
                    null &&
                    hovered !==
                      index &&
                    "blur-sm scale-[0.98]"
                )}
              >

                <AttachmentPreview
                  attachment={img}
                />

                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-semibold">
                    +
                    {
                      remainingDesktop
                    }
                  </div>
                )}

              </div>
            );
          })}

      </div>
    </>
  );
}

/* =========================================
   ATTACHMENT PREVIEW
========================================= */

function AttachmentPreview({
  attachment,
}) {

  const [pdfThumbnail, setPdfThumbnail] =
    useState(null);

  /* ======================================
     LOAD PDF THUMBNAIL
  ====================================== */

  useEffect(() => {

    let mounted = true;

    async function loadThumbnail() {

      if (
        attachment?.type ===
          "application/pdf" &&
        attachment?.url
      ) {

        const thumbnail =
          await getPdfThumbnail(
            attachment.url
          );

        if (
          mounted &&
          thumbnail
        ) {
          setPdfThumbnail(
            thumbnail
          );
        }
      }
    }

    loadThumbnail();

    return () => {
      mounted = false;
    };

  }, [
    attachment?.type,
    attachment?.url,
  ]);

  /* ======================================
     IMAGE
  ====================================== */

  if (
    attachment?.type?.startsWith(
      "image/"
    )
  ) {

    return (
      <Image
        src={attachment.url}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 680px"
        className="object-cover hover:opacity-90 transition"
      />
    );
  }

  /* ======================================
     PDF
  ====================================== */

  if (
    attachment?.type ===
    "application/pdf"
  ) {

    if (pdfThumbnail) {

      return (
        <>
          <Image
            src={pdfThumbnail}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />

          {/* DARK OVERLAY */}

          <div className="absolute inset-0 bg-black/20" />

          {/* PDF BADGE */}

          <div
            className="
              absolute
              bottom-2
              right-2

              flex
              items-center
              gap-1

              bg-black/70
              text-white

              px-2
              py-1

              rounded-md
              backdrop-blur-sm
            "
          >

            <FileText className="h-3.5 w-3.5" />

            <span className="text-[10px] font-medium">
              PDF
            </span>

          </div>
        </>
      );
    }

    return (
      <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center">

        <FileText className="h-10 w-10 text-red-500" />

        <span className="mt-2 text-xs font-medium">
          PDF
        </span>

      </div>
    );
  }

  /* ======================================
     OTHER FILES
  ====================================== */

  return (
    <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center">

      <Paperclip className="h-8 w-8 text-muted-foreground" />

      <span className="mt-2 text-xs">
        File
      </span>

    </div>
  );
}