// pages/region/[regionCode].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
      <div className={styles.pageLoading}>
        <Spinner />
      </div>
    );
  }

  if (!regionCode) {
    return (
      <div className={styles.errorContainer}>
        <h2>Invalid Region</h2>
        <p>Region code is required.</p>
      </div>
    );
  }

  return (
    <div className={styles.regionPage}>
      <RegionProvider regionCode={regionCode}>
        <RegionLayout />
      </RegionProvider>
    </div>
  );
}