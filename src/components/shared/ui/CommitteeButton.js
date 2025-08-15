import { useState } from "react";
import styles from "styles/profile.module.css";
import Form from "components/Form";
import { useAuth } from "context/AuthContext";

export default function CommitteeButton() {
  const [showForm, setShowForm] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const { user, getAccessToken } = useAuth();

  const handleButtonClick = async () => {
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

      if (!data.is_member && !data.has_application) {
        setShowForm(true);
      }
    } catch (err) {
      console.error("Error checking status:", err);
      alert("Error checking your application status. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.committeeButtonContainer}>
      {status?.is_member && (
        <p>You are already a committee member in another ward.</p>
      )}
      {!status?.is_member && status?.has_application && (
        <p>You already have a pending application.</p>
      )}

      {!status?.is_member && !status?.has_application && (
        <button
          onClick={handleButtonClick}
          className={styles.applyBtn}
          disabled={isChecking}
        >
          {isChecking ? "Checking..." : "Apply to Join Committee"}
        </button>
      )}

      <Form show={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
