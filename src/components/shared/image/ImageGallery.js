import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./image.module.css";


export default function ImageStackPopup({
  images = [],
  onClose,
}) {
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const closeZoom = useCallback(() => setZoomedIndex(null), []);
  const prevImage = () =>
    setZoomedIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setZoomedIndex((i) => (i + 1) % images.length);

  // ESC key to close zoom view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (zoomedIndex !== null) {
        if (e.key === "Escape") closeZoom();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [zoomedIndex, closeZoom]);

  return (
    <AnimatePresence>
      {images.length > 0 && (
        <motion.div
          className={styles.overlay}
          onClick={() => zoomedIndex === null && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Grid */}
          <motion.div
            className={styles.gridContainer}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            layout
          >
            {images.map((img, i) => (
              <motion.img
                key={img.id || i}
                src={img}
                alt={`Image ${i + 1}`}
                className={styles.gridImage}
                onClick={() => setZoomedIndex(i)}
                onError={(e) => {
                  e.currentTarget.src = "/no-image.svg";
                }}
                layout
              />
            ))}
          </motion.div>

          {/* Zoom view */}
          <AnimatePresence>
            {zoomedIndex !== null && (
              <motion.div
                className={styles.zoomOverlay}
                onClick={closeZoom}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.img
                  src={images[zoomedIndex]}
                  alt={`Zoomed ${zoomedIndex + 1}`}
                  className={styles.zoomedImage}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}