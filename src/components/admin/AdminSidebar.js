// components/admin/AdminSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { useRouter } from "next/router";
import { FaUsers } from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";
import { TbTimelineEventFilled } from "react-icons/tb";
import { MdAssignment } from "react-icons/md";

const ADMIN_TABS = {
  MEETING: "meeting",
  UPDATE: "update", 
  COMMITTEE: "committee",
  PROJECT: "project",
};

export default function AdminSidebar({ wardId, activeTab }) {
  const router = useRouter();

  const navigateToTab = (tabName) => {
    router.push(`/admin/${wardId}/${tabName}`);
  };

  const renderTabButton = (tabKey, icon, label) => (
    <button
      className={`${styles.tab} ${activeTab === tabKey ? styles.active : ""}`}
      onClick={() => navigateToTab(tabKey)}
      title={label}
    >
      {icon}
      <span className={styles.tabText}>{label}</span>
    </button>
  );

  return (
    <div className={styles.topSidebar}>
      {/* Logo */}
      <div
        className={styles.logoContainer}
        onClick={() => router.push("/")}
        aria-label="Home"
        role="button"
        tabIndex={0}
        title="Home"
      >
        <div className={styles.logoContent}>
          <img
            src="/wp_text_logo.png"
            alt="Walking Project"
            className={styles.logoText}
          />
        </div>
      </div>
      {/* Tabs */}
      <div className={styles.tabContainer}>
        {renderTabButton(
          ADMIN_TABS.MEETING,
          <FaTimeline className={styles.tabIcon} />,
          "Minutes of Meeting",
        )}
        {renderTabButton(
          ADMIN_TABS.UPDATE,
          <TbTimelineEventFilled className={styles.tabIcon} />,
          "Monthly Update",
        )}
        {renderTabButton(
          ADMIN_TABS.COMMITTEE,
          <FaUsers className={styles.tabIcon} />,
          "Ward Committee",
        )}
        {renderTabButton(
          ADMIN_TABS.PROJECT,
          <MdAssignment className={styles.tabIcon} />,
          "Project Taken",
        )}
      </div>
    </div>
  );
}