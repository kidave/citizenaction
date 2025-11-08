// components/shared/ui/CommitteeButton.js
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { useAlert } from "context/AlertContext";
import { useUserStatus } from "hooks/useUserStatus";
import styles from "styles/components/interact/button.module.css";

export default function CommitteeButton({ inline = false, variant = "primary" }) {
  const { user } = useAuth();
  const { showAuthAlert } = useAlert();
  const router = useRouter();
  const { data: status, isLoading } = useUserStatus();

  const handleButtonClick = () => {
    if (!user) {
      showAuthAlert();
      return;
    }

    if (status?.is_member) {
      const isAdmin = [1, 2, 3].includes(status.role_id);
      router.push(
        isAdmin
          ? `/admin/${status.ward_code}/meeting`
          : `/ward/${status.ward_code}/meeting`
      );
      return;
    }

    if (status?.has_application) {
      if (status.application_status === "pending") {
        console.log("Application is pending approval");
        return;
      }
      // For rejected or any other status, allow re-application
      router.push("/joincommittee");
      return;
    }

    // New application
    router.push("/joincommittee");
  };

  if (isLoading && user) {
    return (
      <motion.button
        className={`${styles.committeeButton} ${variant === "secondary" ? styles.secondary : ""} ${inline ? styles.inline : ""}`}
        disabled
      >
        <span className={styles.buttonContent}>
          <span className={styles.spinner}></span>
          Checking...
        </span>
      </motion.button>
    );
  }

  if (status?.is_member) {
    const isAdmin = [1, 2, 3].includes(status.role_id);
    return (
      <motion.button
        onClick={() =>
          router.push(
            isAdmin
              ? `/admin/${status.ward_code}/meeting`
              : `/ward/${status.ward_code}/meeting`
          )
        }
        className={`${styles.committeeButton} ${variant === "secondary" ? styles.secondary : ""} ${inline ? styles.inline : ""}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {status.ward_name}
      </motion.button>
    );
  }

  if (status?.has_application && status.application_status === "pending") {
    return (
      <div className={`${styles.pendingStatus} ${inline ? styles.inline : ""}`}>
        Application Pending
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleButtonClick}
      className={`${styles.committeeButton} ${variant === "secondary" ? styles.secondary : ""} ${inline ? styles.inline : ""}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Join Committee
    </motion.button>
  );
}