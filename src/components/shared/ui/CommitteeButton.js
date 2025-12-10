// components/shared/ui/CommitteeButton.js
import { useState, useEffect } from "react";
import styles from "styles/components/interact/button.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { useAlert } from "context/AlertContext";
import { useUserStatus } from "hooks/useUserStatus";

export default function CommitteeButton({ inline = false }) {
  const router = useRouter();
  const { user } = useAuth();
  const { showAuthAlert } = useAlert();
  const { data: status, isLoading } = useUserStatus();

  // 🟢 Prevent hydration mismatch
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    return (
      <button className={`${styles.committeeButton} ${styles.secondary}`}>
        Join Committee
      </button>
    );
  }

  const goToScopeDashboard = () => {
    if (!status) return;

    switch (status.scope_type) {
      case "Ward":
        return router.push(`/admin/ward/${status.ward_code}/project`);
      case "City":
        return router.push(`/admin/city/${status.city_code}/project`);
      case "Region":
        return router.push(`/admin/region/${status.region_code}/project`);
      case "State":
        return router.push(`/admin/state/${status.state_code}/project`);
      default:
        return router.push("/joincommittee");
    }
  };

  const handleClick = () => {
    if (!user) return showAuthAlert();

    if (status?.is_member) return goToScopeDashboard();

    if (status?.has_application) {
      if (status.application_status === "Pending") return;
      return router.push("/joincommittee");
    }

    return router.push("/joincommittee");
  };

  // 🟡 Loading (but only if no cached status)
  if (isLoading && !status) {
    return (
      <motion.button className={`${styles.committeeButton} ${styles.secondary}`}>
        <span className={styles.spinner}></span> Checking...
      </motion.button>
    );
  }

  // 🟢 Member state (multi-scope)
  if (status?.is_member) {
    const label =
      status.ward_name ||
      status.city_code ||
      status.region_code ||
      status.state_code ||
      "Committee";

    return (
      <motion.button
        onClick={goToScopeDashboard}
        className={`${styles.committeeButton} ${styles.secondary} ${inline ? styles.inline : ""}`}
        title={`Role: ${status.scope_role}`}
      >
        <span className={styles.buttonContent}>
          {label}
          <span className={styles.roleBadge}>{status.scope_role}</span>
        </span>
      </motion.button>
    );
  }

  // 🟡 Pending application
  if (status?.has_application && status.application_status === "Pending") {
    return (
      <div className={`${styles.pendingStatus} ${inline ? styles.inline : ""}`}>
        Application Pending
      </div>
    );
  }

  // 🟢 Default
  return (
    <motion.button
      onClick={handleClick}
      className={`${styles.committeeButton} ${styles.secondary} ${inline ? styles.inline : ""}`}
    >
      Join Committee
    </motion.button>
  );
}
