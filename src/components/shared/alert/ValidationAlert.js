// components/shared/alert/ValidationAlert.js
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiX } from "react-icons/fi";
import styles from "styles/components/alert.module.css";

const ValidationAlert = ({
  isOpen,
  onClose,
  title = "Validation Error",
  message = "Please check your input.",
  errors = [],
  buttonText = "Fix Errors",
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
              className={`${styles.alert} ${styles.validationAlert}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <div className={styles.alertIcon}>
                    <FiAlertCircle />
                  </div>
                  <h3 className={styles.alertTitle}>{title}</h3>
                  <button className={styles.closeButton} onClick={onClose}>
                    <FiX />
                  </button>
                </div>

                <p className={styles.alertMessage}>{message}</p>

                {errors.length > 0 && (
                  <ul className={styles.validationErrors}>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}

                <div className={styles.alertButtons}>
                  <button
                    className={styles.validationButton}
                    onClick={onClose}
                  >
                    {buttonText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ValidationAlert;