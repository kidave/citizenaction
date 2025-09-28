// components/ward/WardLayout.js
import { useMediaQuery } from "react-responsive";
import styles from "styles/layout/container.module.css";
import Layout from "components/home/Layout";
import WardSidebar from "./WardSidebar";
import WardBottomBar from "./WardBottomBar";
import WardContent from "./WardContent";
import { useRouter } from "next/router";
import { WardProvider } from "context/WardContext";
import Spinner from "components/shared/ui/Spinner";

function WardLayoutContent() {
  const router = useRouter();
  const { wardId, tab: activeTab } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  return (
    <Layout>
      <div className={styles.page}>
        {/* Show sidebar on desktop only */}
        {isDesktop && <WardSidebar />}
        
        <div className={styles.wardMain}>
          <WardContent activeTab={activeTab} />
        </div>

        {/* Show bottom bar on mobile AND tablet */}
        {(isMobile || isTablet) && <WardBottomBar activeTab={activeTab} />}
      </div>
    </Layout>
  );
}

export default function WardLayout() {
  const router = useRouter();
  const { wardId } = router.query;

  if (!wardId) return <Spinner mode="fullscreen" />;

  return (
    <WardProvider wardId={wardId}>
      <WardLayoutContent />
    </WardProvider>
  );
}