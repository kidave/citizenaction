// components/shared/alert/CustomAlert.js
import { motion, AnimatePresence } from "framer-motion";
import styles from "styles/components/feedback/alert.module.css";

const CustomAlert = ({
  isOpen,
  onClose,
  title,
  message,
  icon,
  buttons,
  customContent,
  theme = "default",
  withBackdrop = true
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {withBackdrop && (
            <motion.div
              className={styles.alertBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
          )}

          <div className={styles.alertContainer}>
            <motion.div
              className={`${styles.alert} ${styles[`${theme}Alert`]}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  {icon && <div className={styles.alertIcon}>{icon}</div>}
                  <h3 className={styles.alertTitle}>{title}</h3>
                  <button className={styles.closeButton} onClick={onClose}>
                    ×
                  </button>
                </div>

                {message && <p className={styles.alertMessage}>{message}</p>}

                {customContent}

                {buttons && (
                  <div className={styles.alertButtons}>
                    {buttons}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomAlert;