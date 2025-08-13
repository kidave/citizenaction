import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
import styles from "styles/profile.module.css";

export default function ProfileHeader() {
  const router = useRouter();

  return (
    <div className={styles.header}>
      <button
        onClick={() => router.back()}
        className={styles.backButton}
        aria-label="Go back"
      >
        <FiArrowLeft size={24} />
      </button>
      <h1>Your Profile</h1>
    </div>
  );
}
