import styles from "styles/components/modal.module.css";

export default function Modal({ isOpen, imageUrl, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <img
          src={imageUrl}
          alt="Reference"
          className={styles.modalImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-image.jpg";
          }}
        />
      </div>
    </div>
  );
}
