import {
  MeetingTab,
  UpdateTab,
  CommitteeTab,
  ActionTab,
  RoadTab,
  JunctionTab,
  ProjectTab,
} from "components/ward/Tabs";
import styles from "styles/layout/container.module.css";
import WardHeader from "./WardHeader";
import { useWard } from "context/WardContext";

export default function WardContent({ 
  activeTab, 
  onRoadClick, 
  selectedRoad, 
  onJunctionClick, 
  selectedJunction 
}) {
  const { wardInfo } = useWard();

  const showHeader = [
    "meeting",
    "update",
    "project",
    "road",
    "junction",
    "committee",
  ].includes(activeTab);

  const tabComponents = {
    meeting: <MeetingTab />,
    update: <UpdateTab />,
    committee: <CommitteeTab />,
    action: <ActionTab />,
    road: <RoadTab onRoadClick={onRoadClick} selectedRoad={selectedRoad} />,
    junction: <JunctionTab onJunctionClick={onJunctionClick} selectedJunction={selectedJunction} />,
    project: <ProjectTab />,
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
      {tabComponents[activeTab] || <ProjectTab />}
    </div>
  );
}