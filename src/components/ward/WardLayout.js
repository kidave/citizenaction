// components/ward/WardLayout.js
import { useMediaQuery } from "react-responsive";
import styles from "styles/layout/container.module.css";
import Layout from "components/home/Layout";
import WardSidebar from "./WardSidebar";
import WardBottomBar from "./WardBottomBar";
import WardHeader from "./WardHeader";
import { useRouter } from "next/router";
import { WardProvider } from "context/WardContext";
import Spinner from "components/shared/ui/Spinner";

// Import tab components directly
import MeetingTab from "./tabs/MeetingTab";
import UpdateTab from "./tabs/UpdateTab";
import CommitteeTab from "./tabs/CommitteeTab";
import RoadTab from "./tabs/RoadTab";
import JunctionTab from "./tabs/JunctionTab";
import ProjectTab from "./tabs/ProjectTab";

function WardLayoutContent() {
  const router = useRouter();
  const { wardCode, tab: activeTab } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  const tabComponents = {
    meeting: <MeetingTab />,
    update: <UpdateTab />,
    committee: <CommitteeTab />,
    road: <RoadTab />,
    junction: <JunctionTab />,
    project: <ProjectTab />,
  };

  return (
    <Layout>
      <div className={styles.page}>
        {/* Show sidebar on desktop only */}
        {isDesktop && <WardSidebar />}
        
        <div className={styles.wardMain}>
          <WardHeader />
          {tabComponents[activeTab] || <ProjectTab />}
        </div>

        {/* Show bottom bar on mobile AND tablet */}
        {(isMobile || isTablet) && <WardBottomBar activeWardTab={activeTab} />}
      </div>
    </Layout>
  );
}

export default function WardLayout() {
  const router = useRouter();
  const { wardCode } = router.query;

  if (!wardCode) return <Spinner mode="fullscreen" />;

  return (
    <WardProvider wardCode={wardCode}>
      <WardLayoutContent />
    </WardProvider>
  );
}