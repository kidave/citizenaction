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

  const tabComponents = {
    timeline: <TimelineTab timelines={timeline} wardInfo={wardInfo} />,
    member: <MemberTab members={member} wardInfo={wardInfo} />,
    action: <ActionTab actions={action} />,
    road: <RoadTab roads={road} onRoadClick={onRoadClick} selectedRoad={selectedRoad} wardInfo={wardInfo} />,
    junction: <JunctionTab junctions={junction} />,
    project: <ProjectTab projects={project} />,
  };

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
      {tabComponents[activeTab] || tabComponents['timeline']}
    </div>
  );
}