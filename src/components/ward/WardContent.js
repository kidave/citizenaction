// components/ward/WardContent.js
import styles from "styles/layout/container.module.css";
import WardHeader from "./WardHeader";
import { useWard } from "context/WardContext";

// Import tab components directly
import MeetingTab from "./tabs/MeetingTab";
import UpdateTab from "./tabs/UpdateTab";
import CommitteeTab from "./tabs/CommitteeTab";
import ActionTab from "./tabs/ActionTab";
import RoadTab from "./tabs/RoadTab";
import JunctionTab from "./tabs/JunctionTab";
import ProjectTab from "./tabs/ProjectTab";

export default function WardContent({ activeTab }) {
  const { wardInfo } = useWard();

  const tabComponents = {
    meeting: <MeetingTab />,
    update: <UpdateTab />,
    committee: <CommitteeTab />,
    action: <ActionTab />,
    road: <RoadTab />,
    junction: <JunctionTab />,
    project: <ProjectTab />,
  };

  return (
    <div className={styles.wardContent}>
      <WardHeader />
      {tabComponents[activeTab] || <MeetingTab />}
    </div>
  );
}