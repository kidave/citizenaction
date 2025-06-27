// components/shared/ImageComparison.js
import styles from '../../../styles/layout/junction.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function ImageComparison({
  beforeImages,
  afterImages,
  beforeIndex,
  afterIndex,
  onBeforeIndexChange,
  onAfterIndexChange
}) {
  return (
    <div className={styles.imageComparison}>
      <ImagePanel
        title="Before"
        images={beforeImages}
        currentIndex={beforeIndex}
        onNavigate={onBeforeIndexChange}
      />
      <ImagePanel
        title="After"
        images={afterImages}
        currentIndex={afterIndex}
        onNavigate={onAfterIndexChange}
      />
    </div>
  );
}

function ImagePanel({ title, images, currentIndex, onNavigate }) {
  const hasImages = images.length > 0;

  return (
    <div className={styles.imageGrid}>
      <h5>{title}</h5>
      <div className={styles.imageSlider}>
        {hasImages ? (
          <>
            <button
              onClick={() => onNavigate(prev => Math.max(0, prev - 1))}
              className={styles.navButton}
              disabled={images.length <= 1}
              type="button"
              aria-label="Previous image"
            >
              <FaChevronLeft />
            </button>
            <img
              src={images[currentIndex]?.url}
              alt={`${title} ${currentIndex + 1}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/no-image.svg';
              }}
            />
            <button
              onClick={() => onNavigate(prev => (prev + 1) % images.length)}
              className={styles.navButton}
              disabled={images.length <= 1}
              type="button"
              aria-label="Next image"
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
            <img
              src='/no-image.svg'
              alt="No image available"
              className={styles.noImage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
