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
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={startIndex}
      slides={images.map((img) => ({
        src: img.url,
      }))}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
      }}
    />
  );
}