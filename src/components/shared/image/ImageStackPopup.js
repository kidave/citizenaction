import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ImageStackPopup.module.css";

const BUCKET_URL =
  "https://<your-project-id>.supabase.co/storage/v1/object/public/project-images/";

// Safer resolver (handles string or object)
const resolveUrl = (img) => {
  if (!img) return "/no-image.svg";
  const path = typeof img === "string" ? img : img?.path;
  if (!path) return "/no-image.svg";
  if (path.startsWith("http")) return path;
  return `${BUCKET_URL}${path}`;
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

export default function ImageStackPopup({
  images = [],
  onClose,
  isConvenor = false,
  onDeleteImage,
}) {
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const closeZoom = useCallback(() => setZoomedIndex(null), []);
  const prevImage = () =>
    setZoomedIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setZoomedIndex((i) => (i + 1) % images.length);

  const handleDelete = async () => {
    if (!onDeleteImage || zoomedIndex === null) return;
    try {
      setDeleting(true);
      setError(null);
      const target = images[zoomedIndex];
      await onDeleteImage(target);
      // Optimistic remove from local view
      images.splice(zoomedIndex, 1);
      setZoomedIndex(null);
    } catch (err) {
      console.error("Failed to delete image:", err);
      setError("Failed to delete image. Please try again.");
    } finally {
      setDeleting(false);
    }
  };


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
                src={resolveUrl(img)}
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
                  src={resolveUrl(images[zoomedIndex])}
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
                {isConvenor && (
                  <div className={styles.zoomActions}>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={styles.deleteButton}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}