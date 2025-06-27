import { MemberTab, ActionTab, RoadTab, TimelineTab, JunctionTab, ProjectTab } from './tabs';
import styles from '../../styles/layout/container.module.css';
import WardHeader from './WardHeader';

export default function WardContent({ 
  activeTab,
  action,
  member, 
  road,
  junction,
  timeline,
  onRoadClick,
  wardInfo,
  selectedRoad,
  project,
}) {

  const showHeader = ['timeline'].includes(activeTab);

  return (
    <div className={styles.wardContent}>
      <WardHeader 
        wardName={wardInfo?.wardName}
        convenor={wardInfo?.convenor}
        convenorEmail={wardInfo?.convenorEmail}
        coConvenor={wardInfo?.coConvenor}
        coConvenorEmail={wardInfo?.coConvenorEmail}
        showHeader={showHeader}
      />
      {activeTab === 'timeline' && <TimelineTab timelines={timeline} wardInfo={wardInfo} />}
      {activeTab === 'action' && <ActionTab actions={action} />}
      {activeTab === 'member' && <MemberTab members={member} wardInfo={wardInfo} />}
      {activeTab === 'road' && <RoadTab roads={road} onRoadClick={onRoadClick} selectedRoad={selectedRoad} wardInfo={wardInfo} />}
      {activeTab === 'junction' && <JunctionTab junctions={junction} />}
      {activeTab === 'project' && <ProjectTab projects={project} />}
    </div>
  );
}