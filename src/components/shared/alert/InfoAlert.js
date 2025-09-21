// components/shared/alert/InfoAlert.js
import { motion, AnimatePresence } from "framer-motion";
import { FiInfo, FiX } from "react-icons/fi";
import styles from "styles/components/alert.module.css";

const InfoAlert = ({
  isOpen,
  onClose,
  title = "Information",
  message = "Here's some information you should know.",
  buttonText = "Got it",
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
              className={`${styles.alert} ${styles.infoAlert}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <div className={styles.alertIcon}>
                    <FiInfo />
                  </div>
                  <h3 className={styles.alertTitle}>{title}</h3>
                  <button className={styles.closeButton} onClick={onClose}>
                    <FiX />
                  </button>
                </div>

                <p className={styles.alertMessage}>{message}</p>

                <div className={styles.alertButtons}>
                  <button
                    className={styles.infoButton}
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

export default InfoAlert;