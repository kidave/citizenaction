// components/ward/WardLayout.js
import { useState } from 'react';
import { WardProvider, useWard } from '../../src/context/WardContext';
import WardSidebar from './WardSidebar';
import WardContent from './WardContent';
import styles from '../../styles/layout/container.module.css';
import { useRouter } from 'next/router';

// A sub-component to fetch and render content, so it can be wrapped by the provider
function WardLayoutContent() {
  const router = useRouter();
  const { tab: activeTab } = router.query;
  const [selectedRoad, setSelectedRoad] = useState(null);

  // Use the context to get all data. The provider is managing the hooks.
  const {
    wardInfo,
    meetings,
    updates,
    members,
    actions,
    roads,
    junctions,
    projects,
    loading,
    error,
  } = useWard();

  return (
    <div className={styles.page}>
      <div className={styles.wardMain}>
        <WardSidebar disabledTabs={['action']} />
        <WardContent
          activeTab={activeTab}
          meeting={meetings}
          update={updates}
          action={actions}
          member={members}
          road={roads}
          wardInfo={wardInfo}
          onRoadClick={setSelectedRoad}
          loading={loading}
          error={error}
          selectedRoad={selectedRoad}
          junction={junctions}
          project={projects}
        />
      </div>
    </div>
  );
}


// The main export wraps everything in the provider
export default function WardLayout() {
  const router = useRouter();
  const { wardId } = router.query;

  if (!wardId) {
    return <div>Loading Ward...</div>;
  }
  
  return (
    <WardProvider wardId={wardId}>
      <WardLayoutContent />
    </WardProvider>
  );
}