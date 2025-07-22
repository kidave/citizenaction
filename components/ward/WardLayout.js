// components/ward/WardLayout.js
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import styles from '../../styles/layout/container.module.css';
import WardSidebar from './WardSidebar';
import WardBottomBar from './WardBottomBar';
import WardContent from './WardContent';
import { useRouter } from 'next/router';
import { useWard, WardProvider } from '../../src/context/WardContext';

function WardLayoutContent() {
  const router = useRouter();
  const { wardId, tab: activeTab } = router.query;
  const [selectedRoad, setSelectedRoad] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { wardInfo, meetings, updates, members, actions, roads, junctions, projects } = useWard();

  const handleTabChange = (tab) => {
    router.push(`/ward/${wardId}/${tab}`);
  };

  return (
    <div className={styles.page}>
      {/* Show sidebar only on desktop */}
      {!isMobile && <WardSidebar disabledTabs={['action']} />}
      
      <div className={styles.wardMain}>
        <WardContent
          activeTab={activeTab}
          meeting={meetings}
          update={updates}
          action={actions}
          member={members}
          road={roads}
          wardInfo={wardInfo}
          onRoadClick={setSelectedRoad}
          selectedRoad={selectedRoad}
          junction={junctions}
          project={projects}
        />
      </div>

      {/* Show bottom bar only on mobile */}
      {isMobile && (
        <WardBottomBar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          wardInfo={wardInfo}
        />
      )}
    </div>
  );
}

export default function WardLayout() {
  const router = useRouter();
  const { wardId } = router.query;

  if (!wardId) return <div>Loading Ward...</div>;

  return (
    <WardProvider wardId={wardId}>
      <WardLayoutContent />
    </WardProvider>
  );
}