// components/admin/AdminContent.js (Simplified)
import styles from "styles/layout/container.module.css";

// Import admin tab components
import MeetingAdmin from "./tabs/MeetingAdmin";
import UpdateAdmin from "./tabs/UpdateAdmin";
import CommitteeAdmin from "./tabs/CommitteeAdmin";
import ProjectAdmin from "./tabs/ProjectAdmin";

export default function AdminContent({ activeTab, wardId }) {
  const tabComponents = {
    meeting: <MeetingAdmin wardId={wardId} />,
    update: <UpdateAdmin wardId={wardId} />,
    committee: <CommitteeAdmin wardId={wardId} />,
    project: <ProjectAdmin wardId={wardId} />,
  };

  return (
    <div className={styles.wardContent}>
      {tabComponents[activeTab] || <MeetingAdmin wardId={wardId} />}
    </div>
  );
}