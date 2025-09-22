// components/region/RegionLayout.js
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/router";
import Layout from "components/home/Layout";
import { RegionProvider } from "context/RegionContext";
import RegionSidebar from "./RegionSidebar";
import RegionContent from "./RegionContent";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/container.module.css";


function RegionLayoutContent() {
  const router = useRouter();
  const { regionCode, tab: activeTab } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  return (
    <Layout>
      <div className={styles.page}>
        {/* Show sidebar on desktop only (not mobile or tablet) */}
        {!isMobile && !isTablet && <RegionSidebar />}
        
        <div className={styles.wardMain}>
          <RegionContent activeTab={activeTab} />
        </div>

        {/* {isMobile && <WardBottomBar activeTab={activeTab} />} */}
      </div>
    </Layout>
  );
}

export default function RegionLayout() {
  const router = useRouter();
  const { regionCode } = router.query;

  if (!regionCode) return <Spinner mode="fullscreen" />;

  return (
    <RegionProvider regionCode={regionCode}>
      <RegionLayoutContent />
    </RegionProvider>
  );
}