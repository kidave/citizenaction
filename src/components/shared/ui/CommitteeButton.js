// components/shared/ui/CommitteeButton.js
import { useState } from "react";
import { motion } from "framer-motion";
import Form from "components/home/Form";
import { useAuth } from "context/AuthContext";
import styles from "styles/components/Button.module.css";

export default function CommitteeButton({ inline = false, variant = "primary" }) {
  const [showForm, setShowForm] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const { user, getAccessToken } = useAuth();

  const handleButtonClick = async () => {
    if (!user) {
      // Redirect to login or show auth modal
      alert("Please log in to join the committee");
      return;
    }

    setIsChecking(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/committee/check", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to check status");

      const data = await res.json();
      setStatus(data);

      if (!data.is_member && !data.has_application) {
        setShowForm(true);
      } else if (data.is_member) {
        alert("You are already a committee member!");
      } else if (data.has_application) {
        alert("You already have a pending application.");
      }
    } catch (err) {
      console.error("Error checking status:", err);
      alert("Error checking your application status. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

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

      <Form show={showForm} onClose={() => setShowForm(false)} />
    </>
  );
}