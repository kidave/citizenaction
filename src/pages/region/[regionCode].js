// pages/region/[regionCode].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "components/home/Layout";
import { RegionProvider } from "context/RegionContext";
import RegionLayout from "components/region/RegionLayout";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/region.module.css";

export default function RegionPage() {
  const router = useRouter();
  const { regionCode, tab } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  // Wait for router to be ready
  useEffect(() => {
    if (router.isReady) {
      setIsLoading(false);
    }
  }, [router.isReady]);

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.pageLoading}>
          <Spinner />
        </div>
      </Layout>
    );
  }

  if (!regionCode) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <h2>Invalid Region</h2>
          <p>Region code is required.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.regionPage}>
        <RegionProvider regionCode={regionCode}>
          <RegionLayout />
        </RegionProvider>
      </div>
    </Layout>
  );
}