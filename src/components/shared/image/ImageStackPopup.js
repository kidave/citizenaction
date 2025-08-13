import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ImageStackPopup.module.css";

const BUCKET_URL =
  "https://<your-project-id>.supabase.co/storage/v1/object/public/project-images/";

const resolveUrl = (img) => {
  if (!img) return "/no-image.svg";
  if (img.startsWith("http")) return img;
  return `${BUCKET_URL}${img}`;
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const gridVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.05 },
  },
  exit: { scale: 0.95, opacity: 0 },
};

const itemVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300 },
  },
  exit: { scale: 0.8, opacity: 0 },
};

const zoomOverlayVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(4px)",
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
};

const zoomImageVariants = {
  hidden: { scale: 0.5, rotateX: 30, opacity: 0 },
  visible: {
    scale: 1,
    rotateX: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 250, damping: 20 },
  },
  exit: { scale: 0.5, rotateX: 30, opacity: 0 },
};

export default function ImageStackPopup({ images, onClose }) {
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
          onClick={() => {
            if (zoomedIndex === null) onClose(); // only close stack if no zoom
          }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className={styles.gridContainer}
            onClick={(e) => e.stopPropagation()}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {images.map((img, i) => (
              <motion.img
                key={i}
                src={resolveUrl(img)}
                alt={`Image ${i + 1}`}
                className={styles.gridImage}
                variants={itemVariants}
                layout
                onClick={() => setZoomedIndex(i)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/no-image.svg";
                }}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {zoomedIndex !== null && (
              <motion.div
                className={styles.zoomOverlay}
                onClick={closeZoom} // clicking outside zoomed image closes zoom only
                variants={zoomOverlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.img
                  src={resolveUrl(images[zoomedIndex])}
                  alt={`Zoomed Image ${zoomedIndex + 1}`}
                  className={styles.zoomedImage}
                  variants={zoomImageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={(e) => e.stopPropagation()}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -50) {
                      nextImage();
                    } else if (info.offset.x > 50) {
                      prevImage();
                    }
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
