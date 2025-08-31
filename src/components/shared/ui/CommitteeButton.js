// components/shared/ui/CommitteeButton.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Form from "components/home/Form";
import { useAuth } from "context/AuthContext";
import styles from "styles/components/button.module.css";

export default function CommitteeButton({ inline = false, variant = "primary" }) {
  const [showForm, setShowForm] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const { user, getAccessToken } = useAuth();
  const router = useRouter();

  const checkStatus = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/committee/check", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to check status");

      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Error checking status:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user]);

  const handleButtonClick = async () => {
    if (!user) {
      alert("Please log in to join the committee");
      return;
    }

    if (status?.is_member) {
      // Redirect to user's ward
      router.push(`/ward/${status.ward_code}`);
      return;
    }

    if (status?.has_application) {
      if (status.application_status === "Pending") {
        alert("Your application is pending approval.");
      } else if (status.application_status === "Rejected") {
        setShowForm(true);
      }
      return;
    }

    // No existing application, show form
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    checkStatus(); // Refresh status after successful submission
  };

  if (status?.is_member) {
    return (
      <motion.button
        onClick={() => router.push(`/ward/${status.ward_code}`)}
        className={`${styles.committeeButton} ${variant === "secondary" ? styles.secondary : ""} ${inline ? styles.inline : ""}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
       My Committee: {status.ward_name}
      </motion.button>
    );
  }

  if (status?.has_application && status.application_status === "Pending") {
    return (
      <div className={`${styles.pendingStatus} ${inline ? styles.inline : ""}`}>
        Application Pending
      </div>
    );
  }

  return (
    <>
      <motion.button
        onClick={handleButtonClick}
        className={`${styles.committeeButton} ${variant === "secondary" ? styles.secondary : ""} ${inline ? styles.inline : ""}`}
        disabled={isChecking}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isChecking ? (
          <span className={styles.buttonContent}>
            <span className={styles.spinner}></span>
            Checking...
          </span>
        ) : (
          "Join Committee"
        )}
      </motion.button>

      <Form show={showForm} onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
    </>
  );
}