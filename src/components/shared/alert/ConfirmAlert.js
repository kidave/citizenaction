// components/shared/alert/ConfirmAlert.js
import { motion, AnimatePresence } from "framer-motion";
import styles from "styles/components/feedback/alert.module.css";

const ConfirmAlert = ({
  isOpen,
  title = "Are you sure?",
  message = "Do you want to proceed?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
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
              onClick={onCancel}
            />
          )}

          <div className={styles.alertContainer}>
            <motion.div
              className={`${styles.alert} ${styles.confirmAlert}`}
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
                <div className={styles.alertButtons}>
                  <button className={styles.successButton} onClick={onConfirm}>
                    {confirmText}
                  </button>
                  <button className={styles.cancelButton} onClick={onCancel}>
                    {cancelText}
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

export default ConfirmAlert;
