import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import MeetingDetails from "./MeetingDetails";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "styles/layout/timeline.module.css";
import { FaUsers, FaImages, FaPlus, FaTrash } from "react-icons/fa";
import { useWard } from "context/WardContext";
import useMeetingImages from "hooks/useMeetingImages";

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TimelineItemMeeting({
  item,
  index,
  isConvenor,
  isNew,
  onCloseNew,
  onSaveComplete,
}) {
  const { wardId } = useWard();
  const { images, uploadImage, deleteImage, resolveUrl } = useMeetingImages(item.id);
  const [isEditing, setIsEditing] = useState(isNew || false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const isLeft = index % 2 === 0;

  const thumbnailsToShow = useMemo(() => {
    if (images.length <= 4) return images;
    return [...images].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [images]);

  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingImage({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
  };

  const confirmImageUpload = async () => {
    if (!pendingImage) return;
    await uploadImage(pendingImage.file);
    setPendingImage(null);
  };

  const cancelImageUpload = () => {
    setPendingImage(null);
  };

  const confirmDeleteImage = async () => {
    if (!pendingDelete) return;
    await deleteImage(pendingDelete.id, pendingDelete.path);
    setPendingDelete(null);
  };

  const cancelDeleteImage = () => {
    setPendingDelete(null);
  };

  const renderCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`${styles.timelineCard} ${styles.meetingCard}`}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.timelineCardTitle}>
          {item.title || "New Meeting"}
        </h4>
        <span className={styles.cardTypeBadge}>Meeting</span>
      </div>
      <MeetingDetails
        item={item}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={() => {
          setIsEditing(false);
          if (onSaveComplete) onSaveComplete();
        }}
        onCancel={() => {
          if (isNew && onCloseNew) onCloseNew();
          else setIsEditing(false);
        }}
        showEdit={isConvenor}
      />
    </motion.div>
  );

  const renderImageContainer = () => (
    <motion.div
      className={styles.imageContainer}
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
    >
      <div className={styles.imageHeader}>
        <FaImages /> <span>Meeting Images</span>
        {isConvenor && (
          <>
            <label htmlFor={`file-input-${item.id}`} className={styles.addImageBtn}>
              <FaPlus /> Add
            </label>
            <input
              id={`file-input-${item.id}`}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleSelectImage}
            />
          </>
        )}
      </div>

      {pendingImage && (
        <div className={styles.previewContainer}>
          <img src={pendingImage.previewUrl} alt="Preview" />
          <div className={styles.previewActions}>
            <button onClick={confirmImageUpload}>Confirm</button>
            <button onClick={cancelImageUpload}>Cancel</button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className={styles.previewContainer}>
          <img src={resolveUrl(pendingDelete.path)} alt="Delete Preview" />
          <div className={styles.previewActions}>
            <button onClick={confirmDeleteImage}>Delete</button>
            <button onClick={cancelDeleteImage}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles.imageThumbs}>
        {thumbnailsToShow.length > 0 ? (
          <>
            {thumbnailsToShow.map((img, idx) => (
              <div key={idx} className={styles.imageWrapper}>
                <img
                  src={resolveUrl(img.path)}
                  alt=""
                  onClick={() => setIsPopupOpen(true)}
                />
                {isConvenor && (
                  <FaTrash
                    className={styles.deleteIcon}
                    onClick={() => setPendingDelete(img)}
                  />
                )}
              </div>
            ))}
            {images.length > thumbnailsToShow.length && (
              <div
                className={styles.moreImages}
                onClick={() => setIsPopupOpen(true)}
              >
                +{images.length - thumbnailsToShow.length}
              </div>
            )}
          </>
        ) : (
          <p>No images yet</p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`${styles.timelineItemMeeting} ${isLeft ? styles.left : styles.right}`}>
      <div className={styles.timelineSide}>
        {isLeft ? renderCard() : renderImageContainer()}
      </div>

      <div className={styles.timelineIconWrapper}>
        <FaUsers className={styles.timelineIconFa} />
        <div
          className={`${styles.timelineDateWrapper} ${isLeft ? styles.rightDate : styles.leftDate}`}
        >
          {formatDate(item.date)}
        </div>
      </div>

      <div className={styles.timelineSide}>
        {!isLeft ? renderCard() : renderImageContainer()}
      </div>

      {isPopupOpen && (
        <ImageStackPopup
          images={images.map(img => resolveUrl(img.path))}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
}
