import { MeetingTab, UpdateTab, MemberTab, ActionTab, RoadTab, JunctionTab, ProjectTab } from './tabs';
import styles from '../../styles/layout/container.module.css';
import WardHeader from './WardHeader';

export default function WardContent({ 
  activeTab,
  action,
  member, 
  road,
  junction,
  onRoadClick,
  wardInfo,
  selectedRoad,
  project,
}) {
  const showHeader = ['meeting', 'update', 'project'].includes(activeTab);

  const tabComponents = {
    meeting: <MeetingTab />,
    update: <UpdateTab />,
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
      {tabComponents[activeTab] || tabComponents['project']}
    </div>
  );
}