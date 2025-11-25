// components/shared/ui/CommitteeButton.js
import styles from "styles/components/interact/button.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { useAlert } from "context/AlertContext";
import { useUserStatus } from "hooks/useUserStatus";

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

    if (status?.is_member && status.ward_code) {
      const isLeader = status.scope_role && ['Convener', 'Co Convener', 'Member'].includes(status.scope_role);
      
      // Use the correct route structure based on your project
      if (isLeader) {
        router.push(`/admin/${status.ward_code}/project`);
      } else {
        router.push(`/ward/${status.ward_code}/project`);
      }
      return;
    }

    if (status?.has_application) {
      if (status.application_status === "Pending") {
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

  if (status?.is_member && status.ward_code) {
    const isLeader = status.scope_role && ['Convener', 'Co Convener', 'Member'].includes(status.scope_role);
    const buttonText = status.ward_name || `Ward ${status.ward_code}`;
    
    // Add role display for better UX
    const getRoleDisplay = () => {
      if (!status.scope_role) return '';
      return status.scope_role;
    };

    const roleDisplay = getRoleDisplay();
    
    return (
      <motion.button
        onClick={() => {
          if (isLeader) {
            router.push(`/admin/ward/${status.ward_code}/project`);
          } else {
            router.push(`/ward/${status.ward_code}/project`);
          }
        }}
        className={`${styles.committeeButton} ${variant === "secondary" ? styles.secondary : ""} ${inline ? styles.inline : ""}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={roleDisplay ? `Role: ${roleDisplay}` : ''}
      >
        <span className={styles.buttonContent}>
          {buttonText}
          {roleDisplay && (
            <span className={styles.roleBadge}>
              {roleDisplay}
            </span>
          )}
        </span>
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