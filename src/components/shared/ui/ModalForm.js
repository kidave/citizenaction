import { useEffect } from "react";
import styles from "styles/components/form.module.css";

export default function Modal({ show, onClose, children }) {
  // Lock scroll + ESC close
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";

      const handleEsc = (e) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEsc);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={styles.formOverlay} onClick={onClose}>
      <div
        className={styles.formModal}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
