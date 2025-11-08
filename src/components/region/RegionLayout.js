// components/region/RegionLayout.js
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/router";
import Layout from "components/home/Layout";
import { RegionProvider } from "context/RegionContext";
import RegionSidebar from "./RegionSidebar";
import RegionBottombar from "./RegionBottombar";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/container.module.css";

// Import tab components directly
import RegionNewsletterTab from "./tabs/RegionNewsletterTab";
import RegionMeetingTab from "./tabs/RegionMeetingTab";
import RegionUpdateTab from "./tabs/RegionUpdateTab";
import RegionProjectTab from "./tabs/RegionProjectTab";
import RegionPolicyTab from "./tabs/RegionPolicyTab";

function RegionLayoutContent() {
  const router = useRouter();
  const { regionCode, tab: activeTab } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  const tabComponents = {
    newsletter: <RegionNewsletterTab />,
    meeting: <RegionMeetingTab />,
    update: <RegionUpdateTab />,
    project: <RegionProjectTab />,
    policy: <RegionPolicyTab />,
  };

  return (
    <Layout>
      <div className={styles.page}>
        {/* Show sidebar on desktop only */}
        {isDesktop && <RegionSidebar />}
        
        <div className={styles.wardMain}>
          {tabComponents[activeTab] || <RegionMeetingTab />}
        </div>

        {/* Show bottom bar on mobile */}
        {(isMobile || isTablet) && <RegionBottombar activeRegionTab={activeTab} />}
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