import { motion } from "framer-motion";
import { FaImages, FaPlus } from "react-icons/fa";
import styles from "styles/layout/timeline.module.css";
import { getPublicImageUrl } from "utils/storage";

export default function MeetingImages({
  images,
  isConvenor,
  onAddImage,
  setPendingImage,
  pendingImage,
  onConfirmImage,
  onCancelImage,
  onOpenPopup,
  delay
}) {
  return (
    <motion.div
      className={styles.imageContainer}
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay }}
    >
      <div className={styles.imageHeader}>
        <FaImages /> <span>Meeting Images</span>
        {isConvenor && (
          <>
            <label htmlFor="file-input" className={styles.addImageBtn}>
              <FaPlus /> Add
            </label>
            {pendingImage && (
              <div className={styles.previewContainer}>
                <img src={URL.createObjectURL(pendingImage)} alt="Preview" />
                <button onClick={onConfirmImage}>Confirm</button>
                <button onClick={onCancelImage}>Cancel</button>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setPendingImage(e.target.files[0])}
            />
          </>
        )}
      </div>

      <div className={styles.imageThumbs}>
        {images.length > 0 ? (
          <>
            {images.slice(0, 2).map((img, idx) => (
              <img
                key={idx}
                src={getPublicImageUrl(img)}
                alt=""
                onClick={onOpenPopup}
              />
            ))}
            {images.length > 2 && (
              <div
                className={styles.moreImages}
                onClick={onOpenPopup}
              >
                +{images.length - 2}
              </div>
            )}
          </>
        ) : (
          <p>No images yet</p>
        )}
      </div>
    </motion.div>
  );
}
