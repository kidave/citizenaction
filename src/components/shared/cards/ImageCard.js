// components/shared/cards/ImageCard.js
import { useState } from "react";
import { motion } from "framer-motion";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "components/shared/image/image.module.css";

export default function ImageCard({ 
  title, 
  subtitle, 
  date, 
  images = [], 
  resolveUrl, 
  badge,
  onClick,
  children 
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);

  const handleImageClick = () => {
    if (images.length > 0) {
      setPopupImages(images.map(img => resolveUrl(img.path)));
      setIsPopupOpen(true);
    }
  };

  return (
    <>
      <motion.div 
        className={styles.imageCard}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {badge && <div className={styles.cardBadge}>{badge}</div>}
        
        {/* Image section - takes priority */}
        {images.length > 0 && (
          <div className={styles.imageSection} onClick={handleImageClick}>
            <img 
              src={resolveUrl(images[0].path)} 
              alt={title}
              className={styles.cardImage}
            />
            {images.length > 1 && (
              <div className={styles.imageCount}>+{images.length - 1}</div>
            )}
          </div>
        )}
        
        {/* Content section */}
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          {date && (
            <div className={styles.cardDate}>
              {new Date(date).toLocaleDateString()}
            </div>
          )}
          {children}
        </div>
      </motion.div>

      {isPopupOpen && (
        <ImageStackPopup
          images={popupImages}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}