// pages/404.js
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "components/home/Layout";
import styles from "styles/layout/error.module.css";

export default function Custom404() {
  const router = useRouter();
  
  // Extract ward code from the path if it's a ward-related 404
  const path = router.asPath;
  const wardMatch = path.match(/\/ward\/([^\/]+)/);
  const wardCode = wardMatch ? wardMatch[1] : null;

  return (
    <Layout>
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1>404 - Page Not Found</h1>
          
          {wardCode ? (
            <>
              <p className={styles.errorMessage}>
                The ward <strong>&quot;{wardCode}&quot;</strong> does not exist or is not available.
              </p>
              <p>
                This ward might not be part of our current coverage area or may have been removed.
              </p>
            </>
          ) : (
            <p className={styles.errorMessage}>
              The page you are looking for does not exist.
            </p>
          )}
          
          <div className={styles.actionButtons}>
            <button 
              onClick={() => router.push('/')}
              className={styles.secondaryButton}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}