import { MemberTab, ActionTab, RoadTab, TimelineTab, JunctionTab } from './tabs';
import styles from '../../styles/layout/container.module.css';

export default function WardContent({ 
  activeTab,
  action,
  member, 
  road,
  junction,
  timeline,
  onRoadClick,
  wardInfo,
  selectedRoad
}) {
  return (
    <div className={styles.wardContent}>
      {activeTab === 'timeline' && <TimelineTab timelines={timeline} wardInfo={wardInfo} />}
      {activeTab === 'action' && <ActionTab actions={action} />}
      {activeTab === 'member' && <MemberTab members={member} />}
      {activeTab === 'road' && <RoadTab roads={road} onRoadClick={onRoadClick} selectedRoad={selectedRoad} wardInfo={wardInfo} />}
      {activeTab === 'junction' && <JunctionTab junctions={junction} />}
    </div>
  );
}