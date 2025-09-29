// components/region/RegionLayout.js
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/router";
import Layout from "components/home/Layout";
import { RegionProvider, useRegion } from "context/RegionContext";
import RegionSidebar from "./RegionSidebar";
import RegionBottomBar from "./RegionBottomBar";
import RegionNewsletterTab from "./tabs/RegionNewsletterTab";
import RegionMeetingTab from "./tabs/RegionMeetingTab";
import RegionUpdateTab from "./tabs/RegionUpdateTab";
import RegionProjectTab from "./tabs/RegionProjectTab";
import RegionPolicyTab from "./tabs/RegionPolicyTab";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/container.module.css";

// components/region/RegionLayout.js
function RegionLayoutContent() {
  const router = useRouter();
  const { tab: activeTab } = router.query;
  const { regionCode } = useRegion();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const tabComponents = {
    newsletter: <RegionNewsletterTab regionCode={regionCode} />,
    meeting: <RegionMeetingTab regionCode={regionCode} />,
    update: <RegionUpdateTab regionCode={regionCode} />,
    project: <RegionProjectTab regionCode={regionCode} />,
    policy: <RegionPolicyTab regionCode={regionCode} />,
  };

  return (
    <Layout>
      <div className={styles.page}>
        {/* Show sidebar on desktop only (not mobile or tablet) */}
        {!isMobile && !isTablet && <RegionSidebar />}
        
        <div className={styles.wardMain}>
          <div className={styles.wardContent}>
            {tabComponents[activeTab] || <RegionMeetingTab regionCode={regionCode} />}
          </div>
        </div>

        {/* Show bottom bar on mobile */}
        {isMobile && <RegionBottomBar activeTab={activeTab} />}
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