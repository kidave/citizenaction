// components/shared/alert/LoadingAlert.js
import { motion, AnimatePresence } from "framer-motion";
import styles from "styles/components/alert.module.css";

const LoadingAlert = ({
  isOpen,
  onClose,
  title = "Processing",
  message = "Please wait while we process your request...",
  withBackdrop = true,
  canDismiss = false
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
              onClick={canDismiss ? onClose : undefined}
            />
          )}

          <div className={styles.alertContainer}>
            <motion.div
              className={`${styles.alert} ${styles.loadingAlert}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <div className={styles.loadingSpinner}></div>
                  <h3 className={styles.alertTitle}>{title}</h3>
                  {canDismiss && (
                    <button className={styles.closeButton} onClick={onClose}>
                      ×
                    </button>
                  )}
                </div>

                <p className={styles.alertMessage}>{message}</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoadingAlert;