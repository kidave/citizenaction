import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "context/AuthContext";
import styles from "styles/profile.module.css";
import ProfileHeader from "components/profile/ProfileHeader";
import ProfileView from "components/profile/ProfileView";
import Spinner from "components/shared/ui/Spinner";
import CommitteeButton from "components/shared/ui/CommitteeButton";
import ErrorMessage from "components/shared/ui/ErrorMessage";

export default function Profile() {
  const {
    user,
    profile,
    loading: authLoading,
    error: authError,
  } = useAuth();

  const router = useRouter();
  const [error, setError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || !profile) {
    return <Spinner mode="fullscreen" />;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Your Profile | Walking Project</title>
      </Head>
      {(authError || error) && (
        <ErrorMessage
          message={authError || error}
          onClose={() => setError(null)}
        />
      )}
      <ProfileHeader />
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

        <ProfileView profile={profile}/>
      </div>
    </div>
  );
}
