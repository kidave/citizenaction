// components/shared/alert/SuccessAlert.js
import { motion, AnimatePresence } from "framer-motion";
import styles from "styles/components/feedback/alert.module.css";

const SuccessAlert = ({
  isOpen,
  onClose,
  title = "Success!",
  message = "Your action was completed successfully.",
  referenceId = null,
  buttonText = "Close",
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
              className={`${styles.alert} ${styles.successAlert}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <h3 className={styles.alertTitle}>{title}</h3>
                </div>

                <p className={styles.alertMessage}>{message}</p>

                {referenceId && (
                  <p className={styles.alertMessage}>
                    Reference ID: <strong>{referenceId}</strong>
                  </p>
                )}

                <div className={styles.alertButtons}>
                  <button
                    className={styles.successButton}
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

export default SuccessAlert;
