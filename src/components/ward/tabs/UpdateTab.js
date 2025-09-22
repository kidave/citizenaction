// components/ward/tabs/UpdateTab.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWard } from "context/WardContext";
import useWardUpdates from "hooks/useWardUpdates";
import useUpdateImages from "hooks/useUpdateImages";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/timeline.module.css";
import { FaImages, FaEye } from "react-icons/fa";

export default function UpdateTab() {
  const { wardId } = useWard();
  const { updates, loading, error } = useWardUpdates(wardId);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);

  if (loading) return <Spinner />;
  if (error) return <div>Error loading updates: {error.message}</div>;

  // Helper function to format dates
  const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  };

  // Helper function to render discussion points
  const renderDiscussion = (label, content) => {
    if (!content) return null;

    const points = Array.isArray(content)
      ? content
      : content.split("\n").filter((s) => s.trim());

    return (
      <div className={styles.operationSection}>
        <h5 className={styles.sectionTitle}>{label}</h5>
        <ul className={styles.discussionList}>
          {points.map((pt, i) => (
            <li key={i} className={styles.discussionPoint}>
              {pt}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Compact Image Container Component
  const CompactImageContainer = ({ updateId, onImageClick }) => {
    const { images, resolveUrl } = useUpdateImages(updateId);
    
    const handleClick = () => {
      onImageClick(images.map(img => resolveUrl(img.path)));
    };

    if (images.length === 0) return null;

    return (
      <div className={styles.compactImageSection}>        
        <div className={styles.compactImageGrid}>
          {images.slice(0, 4).map((img, idx) => (
            <div key={idx} className={styles.compactImageWrapper}>
              <img
                src={resolveUrl(img.path)}
                alt={`Update image ${idx + 1}`}
                onClick={handleClick}
                className={styles.compactImage}
              />
              {idx === 3 && images.length > 4 && (
                <div className={styles.moreImagesOverlay}>
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DesktopUpdateCard = ({ update, index }) => {
    const [isActive, setIsActive] = useState(index === 0);

    return (
      <div className={styles.timelineItemUpdate}>
        <div
          className={styles.centeredDate}
          onClick={() => setIsActive(!isActive)}
          style={{ cursor: "pointer" }}
        >
          {formatDate(update.date)}
        </div>

        <div className={styles.fullWidthCard}>
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className={`${styles.timelineCard} ${styles.updateCard}`}
              >
                
                <div className={styles.updateContent}>
                  {/* Images displayed at the top in a compact format */}
                  <CompactImageContainer 
                    updateId={update.id} 
                    onImageClick={(images) => {
                      setPopupImages(images);
                      setIsPopupOpen(true);
                    }}
                  />
                  
                  {/* Update content */}
                  <div className={styles.updateTextContent}>
                    {renderDiscussion("Key Operations", update.operation)}
                    {renderDiscussion("Description", update.description)}
                    {renderDiscussion("Support Needed", update.support)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.timelineWrapper}>
        {updates.length === 0 ? (
          <p className={styles.emptyTimeline}>No monthly updates yet.</p>
        ) : (
          <div className={styles.desktopView}>
            {updates.map((update, index) => (
              <DesktopUpdateCard 
                key={update.id} 
                update={update} 
                index={index} 
              />
            ))}
          </div>
        )}
      </div>

      {isPopupOpen && (
        <ImageStackPopup
          images={popupImages}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}