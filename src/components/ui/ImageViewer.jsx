"use client";

import { useEffect, useState } from "react";

import Lightbox from "yet-another-react-lightbox";

import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";

export default function ImageViewer({
  open,
  onClose,
  images = [],
  startIndex = 0,
}) {

  const [currentIndex, setCurrentIndex] =
    useState(startIndex);

  /* =========================================
     RESET INDEX ONLY WHEN OPENING
  ========================================= */

  useEffect(() => {

    if (open) {
      setCurrentIndex(startIndex);
    }

  }, [open, startIndex]);

  return (
    <Lightbox
      open={open}

      close={onClose}

      index={currentIndex}

      slides={images.map((img) => ({
        src: img.url,
      }))}

      plugins={[Zoom]}

      carousel={{
        finite: false,
      }}

      controller={{
        closeOnBackdropClick: true,
      }}

      on={{
        view: ({ index }) => {
          setCurrentIndex(index);
        },
      }}

      render={{
        buttonPrev:
          images.length <= 1
            ? () => null
            : undefined,

        buttonNext:
          images.length <= 1
            ? () => null
            : undefined,
      }}

      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
      }}
    />
  );
}