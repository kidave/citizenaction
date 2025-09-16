import styles from "./image.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BUCKET_URL =
  "https://<your-project-id>.supabase.co/storage/v1/object/public/ward/";

const resolveUrl = (img) => {
  if (!img) return "/no-image.svg";
  if (img.startsWith("http")) return img;
  return `${BUCKET_URL}${img}`;
};

export default function ImageComparison({
  beforeImages,
  afterImages,
  beforeIndex,
  afterIndex,
  onBeforeIndexChange,
  onAfterIndexChange,
}) {
  return (
    <div className={styles.imageComparison}>
      <AnimatedImagePanel
        title="Before"
        images={beforeImages}
        currentIndex={beforeIndex}
        onNavigate={onBeforeIndexChange}
      />
      <AnimatedImagePanel
        title="After"
        images={afterImages}
        currentIndex={afterIndex}
        onNavigate={onAfterIndexChange}
      />
    </div>
  );
}

function AnimatedImagePanel({ title, images, currentIndex, onNavigate }) {
  const hasImages = images?.length > 0;

  const handlePrev = () => {
    onNavigate((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    onNavigate((prev) => (prev + 1) % images.length);
  };

  return (
    <motion.div
      className={styles.imageGrid}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
    >
      <h5>{title}</h5>

      <div className={styles.imageSlider}>
        {hasImages ? (
          <>
            <button
              onClick={handlePrev}
              className={styles.navButton}
              disabled={images.length <= 1}
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>

            <div className={styles.imageWrapper}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={`${title}-${currentIndex}`}
                  src={resolveUrl(images[currentIndex])}
                  alt={`${title} ${currentIndex + 1}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.25 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/no-image.svg";
                  }}
                  className={styles.image}
                />
              </AnimatePresence>
            </div>

            <button
              onClick={handleNext}
              className={styles.navButton}
              disabled={images.length <= 1}
              aria-label="Next"
            >
              <FaChevronRight />
            </button>

            {images.length > 1 && (
              <div className={styles.imageCounter}>
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <div className={styles.imagePlaceholder}>
            <img src="/no-image.svg" alt="No image" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
