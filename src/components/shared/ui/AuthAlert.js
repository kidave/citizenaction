// components/shared/ui/AuthAlert.js
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import styles from "styles/components/alert.module.css";

const AuthAlert = ({ 
  isOpen, 
  onClose, 
  title = "Authentication Required", 
  message = "Please log in to access this feature",
  withBackdrop = true
}) => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth');
    onClose();
  };

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
              className={styles.alert}
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
                  <button
                    className={styles.cancelButton}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.loginButton}
                    onClick={handleLogin}
                  >
                    Login
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

export default AuthAlert;