import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./image.module.css";


export default function ImageStackPopup({
  files = [],
  startIndex = 0,
  onClose,
}) {
  const [zoomedIndex, setZoomedIndex] = useState(startIndex);

  const prevImage = useCallback(
    () => setZoomedIndex((i) => (i > 0 ? i - 1 : files.length - 1)),
    [files.length]
  );
  const nextImage = useCallback(
    () => setZoomedIndex((i) => (i + 1) % files.length),
    [files.length]
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
      {files.length > 0 && (
        <motion.div
          className={styles.zoomOverlay}
          onClick={closeZoom}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.img
            key={zoomedIndex}
            src={files[zoomedIndex]}
            alt={`File ${zoomedIndex + 1}`}
            className={styles.zoomedImage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
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
  );
}