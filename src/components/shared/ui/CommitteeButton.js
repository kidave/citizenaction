// components/shared/ui/CommitteeButton.js
import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Form from "components/home/Form";
import { useAuth } from "context/AuthContext";
import { useAuthAlert } from "hooks/useAuthAlert";
import styles from "styles/components/button.module.css";

const fetcher = async ([url, token]) => {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed to check status");
  return res.json();
};

export default function CommitteeButton({ inline = false, variant = "primary" }) {
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState(null);
  const { user, getAccessToken } = useAuth();
  const { showAuthAlert, AuthAlertComponent } = useAuthAlert();
  const router = useRouter();

  // Grab a token once per auth change
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) { setToken(null); return; }
      const t = await getAccessToken();
      if (mounted) setToken(t || null);
    })();
    return () => { mounted = false; };
  }, [user, getAccessToken]);

  // SWR caches this globally, so it won't refetch on every mount/route change
  const {
    data: status,
    error,
    isValidating,
    mutate,
  } = useSWR(user && token ? ["/api/user/check", token] : null, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 60_000, // cache identical requests for 60s
  });

  const handleButtonClick = async () => {
    if (!user) {
      showAuthAlert(); // Simple call - no parameters needed
      return;
    }

    if (status?.is_member) {
      router.push(`/ward/${status.ward_code}`);
      return;
    }

    if (status?.has_application) {
      if (status.application_status === "pending") {
        showAlert("Application Status", "Your application is pending approval.", {
          type: "info",
          duration: 4000
        });
      } else if (status.application_status === "Rejected") {
        setShowForm(true);
      }
      return;
    }

    setShowForm(true);
  };

  // After form submit: refresh cached status, keep modal open so success UI shows
  const handleFormSuccess = async () => {
  };

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
        My Committee: {status.ward_name}
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
    <>
      <motion.button
        onClick={handleButtonClick}
        className={`${styles.committeeButton} ${variant === "secondary" ? styles.secondary : ""} ${inline ? styles.inline : ""}`}
        disabled={!!user && isValidating}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {!!user && isValidating ? (
          <span className={styles.buttonContent}>
            <span className={styles.spinner}></span>
            Checking...
          </span>
        ) : (
          "Join Committee"
        )}
      </motion.button>

      <Form
        show={showForm}
        onClose={() => {
          mutate();      // refresh status only after user closes modal
          setShowForm(false);
        }}
        onSuccess={handleFormSuccess}
      />
      <AuthAlertComponent />
    </>
  );
}
