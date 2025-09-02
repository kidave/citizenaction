// pages/profile.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "context/AuthContext";
import styles from "styles/profile.module.css";
import ProfileHeader from "components/profile/ProfileHeader";
import ProfileView from "components/profile/ProfileView";
import Spinner from "components/shared/ui/Spinner";
import ErrorMessage from "components/shared/ui/ErrorMessage";
import useProfile from "hooks/useProfile";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, error } = useProfile();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Loading state
  if (loading || !user || !profile) {
    return <Spinner mode="fullscreen" />;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Your Profile | Walking Project</title>
      </Head>

      {error && <ErrorMessage message={error} />}

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

        <ProfileView profile={profile} />
      </div>
    </div>
  );
}
