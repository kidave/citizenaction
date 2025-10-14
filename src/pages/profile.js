// pages/profile.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { FiArrowLeft } from "react-icons/fi";
import Spinner from "components/shared/ui/Spinner";
import useProfile from "hooks/useProfile";
import styles from "styles/pages/profile.module.css";
import Layout from "components/home/Layout";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user || !profile) {
    return <Spinner mode="fullscreen" />;
  }

  const hasMobile = !!profile.mobile;
  const mobile = hasMobile ? `+${profile.mobile}` : "N/A";

  return (
    <Layout>
      <div className={styles.profileContainer}>
        <div className={styles.header}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
            aria-label="Go back"
          >
            <FiArrowLeft size={24} />
          </button>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                src={
                  profile.avatar_url ||
                  user.user_metadata?.avatar_url ||
                  "/user1.png"
                }
                alt="Profile"
                className={styles.avatar}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/user1.png";
                }}
              />
            </div>
            <h2 className={styles.userName}>{profile.name || "User"}</h2>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>
                  {mobile}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Designation:</span>
                <span className={styles.value}>{profile.designation || "N/A"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Locality:</span>
                <span className={styles.value}>{profile.locality || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}