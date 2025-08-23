// components/ward/WardLayout.js
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import styles from "styles/layout/container.module.css";
import WardSidebar from "./WardSidebar";
import WardBottomBar from "./WardBottomBar";
import WardContent from "./WardContent";
import { useRouter } from "next/router";
import { useWard, WardProvider } from "context/WardContext";
import Form from "components/home/Form";
import Spinner from "components/shared/ui/Spinner";

function WardLayoutContent() {
  const router = useRouter();
  const { wardId, tab: activeTab } = router.query;
  const [selectedRoad, setSelectedRoad] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showForm, setShowForm] = useState(false);

  const {
    wardInfo,
    meetings,
    updates,
    committees,
    actions,
    roads,
    junctions,
    projects,
  } = useWard();

  const handleTabChange = (tab) => {
    router.push(`/ward/${wardId}/${tab}`);
  };

  return (
    <div className={styles.page}>
      {!isMobile && <WardSidebar disabledTabs={["action"]} />}

      <div className={styles.wardMain}>
        <WardContent
          activeTab={activeTab}
          meeting={meetings}
          update={updates}
          action={actions}
          committee={committees}
          road={roads}
          wardInfo={wardInfo}
          onRoadClick={setSelectedRoad}
          selectedRoad={selectedRoad}
          junction={junctions}
          project={projects}
        />
      </div>

      {isMobile && (
        <WardBottomBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          wardInfo={wardInfo}
          onShowForm={() => setShowForm(true)}
        />
      )}

      <Form show={showForm} onClose={() => setShowForm(false)} />
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
