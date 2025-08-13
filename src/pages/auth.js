// pages/auth.js
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import Head from "next/head";
import styles from "../styles/auth.module.css";
import { FcGoogle } from "react-icons/fc";
import { FiArrowLeft } from "react-icons/fi";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // Do not overwrite the 'returnTo' value if it already exists.
      // This ensures we return to the page before the user landed on /auth.
      if (!localStorage.getItem("returnTo")) {
        localStorage.setItem("returnTo", "/"); // Default to home if not set
      }

      await login();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Get the returnTo value but do not default to '/', as the back button
    // should ideally take the user back to where they came from.
    // However, the current logic is to use 'returnTo' or a default of '/'.
    const returnTo = localStorage.getItem("returnTo") || "/";
    router.push(returnTo);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login | Walking Project</title>
      </Head>

      <div className={styles.authCard}>
        <button onClick={handleBack} className={styles.backButton}>
          <FiArrowLeft size={20} />
          Back
        </button>
        <h1 className={styles.h1}>Login</h1>
        <img src="/wp_text_logo.png" alt="Logo" className={styles.logo} />

        <p className={styles.p}>Mumbai Sustainability Centre © 2024</p>

        {error && <div className={styles.error}>{error}</div>}

        <button
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          disabled={loading}
        >
          <FcGoogle size={20} style={{ marginRight: "10px" }} />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <div className={styles.existingUserNote}>
          Already have an account? You can sign in with the same Google account.
        </div>
      </div>
    </div>
  );
}
