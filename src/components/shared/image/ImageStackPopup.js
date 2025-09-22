import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./image.module.css";

const BUCKET_URL =
  "https://<your-project-id>.supabase.co/storage/v1/object/public/ward/";

const resolveUrl = (img) => {
  if (!img) return "/no-image.svg";
  const path = typeof img === "string" ? img : img?.path;
  if (!path) return "/no-image.svg";
  if (path.startsWith("http")) return path;
  return `${BUCKET_URL}${path}`;
};

export default function ImageStackPopup({
  images = [],
  startIndex = 0,   // <-- pass the clicked image index here
  onClose,
}) {
  const [zoomedIndex, setZoomedIndex] = useState(startIndex);

  const prevImage = useCallback(
    () => setZoomedIndex((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length]
  );
  const nextImage = useCallback(
    () => setZoomedIndex((i) => (i + 1) % images.length),
    [images.length]
  );
  const closeZoom = useCallback(() => onClose?.(), [onClose]);

  // ESC key support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeZoom();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeZoom, prevImage, nextImage]);

  return (
    <AnimatePresence>
      {images.length > 0 && (
        <motion.div
          className={styles.zoomOverlay}
          onClick={closeZoom}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.img
            key={zoomedIndex}
            src={resolveUrl(images[zoomedIndex])}
            alt={`Image ${zoomedIndex + 1}`}
            className={styles.zoomedImage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.x < -50) nextImage();
              if (info.offset.x > 50) prevImage();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
