// pages/auth.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import Head from "next/head";
import styles from "styles/pages/auth.module.css";
import { FcGoogle } from "react-icons/fc";
import { FiArrowLeft, FiLoader, FiShield, FiLock } from "react-icons/fi";
import Layout from "components/home/Layout";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, login } = useAuth();

  // If user is already logged in, redirect to the intended page
  useEffect(() => {
    if (user) {
      const returnTo = localStorage.getItem("returnTo") || "/";
      localStorage.removeItem("returnTo");
      router.replace(returnTo);
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // Store current path before redirecting to auth
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== "/auth") {
          localStorage.setItem("returnTo", currentPath);
        }
      }
      
      await login();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleBack = () => {
    const returnTo = localStorage.getItem("returnTo") || "/";
    localStorage.removeItem("returnTo");
    router.push(returnTo);
  };

  return (
    <Layout >
      <Head>
        <title>Login | Walking Project</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.authCard}>
          <button onClick={handleBack} className={styles.backButton}>
            <FiArrowLeft size={24} />
            Back
          </button>
          
          <div className={styles.logoContainer}>
            <img 
              src="/wp_icon_sm.avif" 
              alt="Logo" 
              className={styles.logoIcon}
            />
            <img
              src="/wp_text_logo.avif"
              alt="Walking Project"
              className={styles.logoText}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            onClick={handleGoogleLogin}
            className={styles.googleButton}
            disabled={loading}
          >
            {loading ? (
              <FiLoader className={styles.spinner} size={20} />
            ) : (
              <FcGoogle size={20} />
            )}
            <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
          </button>

          {/* Security badges */}
          <div className={styles.securityBadges}>
            <div className={styles.securityBadge}>
              <FiShield size={14} />
              <span>Secure Login</span>
            </div>
            <div className={styles.securityBadge}>
              <FiLock size={14} />
              <span>Encrypted</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className={styles.trustIndicators}>
            <p className={styles.trustText}>
              Your information is secure. We use Google's secure authentication and never see your password.
              Read our <a href="/auth/privacy" className={styles.link}>Privacy Policy</a>.
            </p>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Mumbai Sustainability Centre © 2024
            </p>
          </div>
        </div>
        
        <div className={styles.backgroundAnimation}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
      </div>
    </Layout>
  );
}