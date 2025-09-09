// components/ward/WardLayout.js (simplified)
import { useMediaQuery } from "react-responsive";
import styles from "styles/layout/container.module.css";
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

  return (
    <div className={styles.page}>
      {!isMobile && <WardSidebar />}
      
      <div className={styles.wardMain}>
        <WardContent activeTab={activeTab} />
      </div>

      {isMobile && <WardBottomBar activeTab={activeTab} />}
    </div>
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