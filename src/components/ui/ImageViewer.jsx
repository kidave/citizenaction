"use client";

import Lightbox from "yet-another-react-lightbox";

import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";

export default function ImageViewer({
  open,
  onClose,
  images = [],
  startIndex = 0,
}) {
  /* =========================================
     SAFETY
  ========================================= */

  if (!images?.length) {
    return null;
  }

  const safeIndex = Math.min(Math.max(startIndex, 0), images.length - 1);

  return (
    <Lightbox
      key={safeIndex}
      open={open}
      close={() => {
        onClose?.();
      }}
      slides={images.map((img) => ({
        src: img.url,
      }))}
      index={safeIndex}
      plugins={[Zoom]}
      carousel={{
        finite: false,
      }}
      animation={{
        swipe: 250,
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
      }}
    />
  );
}
