// pages/region/[regionCode]/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "components/home/Layout";
import { RegionProvider } from "context/RegionContext";
import RegionLayout from "components/region/RegionLayout";
import styles from "styles/layout/region.module.css";

export default function RegionPage() {
  const router = useRouter();
  const { regionCode } = router.query;

  useEffect(() => {
    if (!regionCode) return;
  }, [regionCode]);

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