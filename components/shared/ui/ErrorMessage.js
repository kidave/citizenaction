// components/shared/ErrorMessage.js
import { useEffect } from 'react';
import styles from '../../../styles/components/error.module.css';

export default function ErrorMessage({ message, onClose, autoDismiss = true, dismissTime = 5000 }) {
  useEffect(() => {
    if (autoDismiss && message) {
      const timer = setTimeout(() => {
        onClose();
      }, dismissTime);
      
      return () => clearTimeout(timer);
    }
  }, [message, autoDismiss, dismissTime, onClose]);

  if (!message) return null;

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <span className={styles.errorText}>{message}</span>
        <button 
          onClick={onClose} 
          className={styles.closeButton}
          aria-label="Dismiss error message"
        >
          &times;
        </button>
      </div>
    </div>
  );
}